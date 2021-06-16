import { setFailed } from "@actions/core";
import {
  merge,
  postComment,
  requireEvent,
  assertValidFilename,
  requirePullNumber,
  requirePr,
  requireFiles,
  getFileDiff,
  assertFilenameAndFileNumbersMatch,
  assertConstantEipNumber,
  assertConstantStatus,
  assertHasAuthors,
  assertIsApprovedByAuthors,
  requireAuthors,
  requestReviewers,
  assertValidStatus,
  requireFilePreexisting,
  assertEIPEditorApproval
} from "./lib";
import {
  DEFAULT_ERRORS,
  EipStatus,
  EIP_EDITORS,
  ERRORS,
  File,
  FileDiff,
  TestResults
} from "./utils";
import {intersection, pick, set} from "lodash"

const testFile = async (
  file: File
): Promise<TestResults> => {
  // we need to define this here because the below logic can get very complicated otherwise
  const errors = DEFAULT_ERRORS;

  // file testing is not compatible (yet) with an initialy undefined file
  // so instead it's required here. It throws an exception for consistency
  const fileDiff = await getFileDiff(file);
  try {
    file = await requireFilePreexisting(file);
  } catch (err) {
    errors.fileErrors.filePreexistingError = err;
    errors.approvalErrors.isEditorApprovedError = await assertEIPEditorApproval(
      file
    );
    // new files are acceptable if an editor has approved
    if (errors.approvalErrors.isEditorApprovedError) {
      return {
        errors,
        fileDiff
      };
    }
  }

  errors.fileErrors.validFilenameError = assertValidFilename(file);
  errors.headerErrors.matchingEIPNumError = assertFilenameAndFileNumbersMatch(
    fileDiff
  );
  errors.headerErrors.constantEIPNumError = assertConstantEipNumber(fileDiff);
  errors.headerErrors.constantStatusError = assertConstantStatus(fileDiff);
  errors.headerErrors.validStatusError = assertValidStatus(fileDiff);
  errors.authorErrors.hasAuthorsError = assertHasAuthors(fileDiff);

  // if no authors then remaining items aren't relevant to check
  if (errors.authorErrors.hasAuthorsError) {
    return {
      errors,
      fileDiff
    };
  }

  errors.approvalErrors.isAuthorApprovedError = await assertIsApprovedByAuthors(
    fileDiff
  );
  return {
    errors,
    fileDiff,
    authors: requireAuthors(fileDiff)
  };
};

const OR = (states: boolean[]) => states.includes(true)

const stateChangeAllowedPurifier = (testResults: TestResults) => {
  const {errors, fileDiff} = testResults;
  
  const isStateChangeAllowed = OR([
    // state changes to withdrawn from anything
    fileDiff?.head.status === EipStatus.withdrawn,
    // state changes from lastcall -> review
    fileDiff?.base.status === EipStatus.lastCall &&
    fileDiff?.head.status === EipStatus.review,
    // editors can approve state changes
    !errors.approvalErrors.isEditorApprovedError
    ])

  if (isStateChangeAllowed) {
    if (errors.headerErrors.constantStatusError) {
      // allows for the header to change to an invalid status
      errors.headerErrors.validStatusError = undefined;
    }
    // always clear the constant status error if changes are allowed
    errors.headerErrors.constantStatusError = undefined;
  }     

  return {
    ...testResults,
    errors
  }
}

const editorApprovalPurifier = (testResults: TestResults) => {
  const isEditorApproved = !testResults.errors.approvalErrors.isEditorApprovedError;
  const isNewFile = !!testResults.errors.fileErrors.filePreexistingError;

  if (isEditorApproved && isNewFile) {
    testResults.errors.fileErrors.filePreexistingError = undefined;
  } 

  if (!isEditorApproved) {
    if (!isNewFile) {
      testResults.errors.approvalErrors.isEditorApprovedError = undefined;
    }
  }

  return testResults
}

/**
 * designed to collect the purified results and return the common paths;
 * this is useful because it means that if one error is purified in one 
 * purifier but not in others it will be purified in this step, which 
 * avoids race conditions and keeps logic linear and shallow (improves
 * readability)
 * 
 * @param parent common ancestor between potentially mutated objects
 * @param objects mutated objects from ancestor
 * @returns common paths of the mutated objects relative to the parent
 */
const innerJoinAncestors = (parent: TestResults, objects: TestResults[]) => {
  function rKeys(obj: TestResults, path?: string) {
    if (!obj || typeof obj !== "object") return path;
    return Object.keys(obj).map((key) =>
      rKeys(obj[key], path ? [path, key].join(".") : key)
    );
  }

  const objectPaths = objects.map((obj) => rKeys(obj).toString().split(",") as string[]);
  const commonPaths = intersection(...objectPaths);
  const clearPaths = rKeys(parent).toString().split(",").filter(path => commonPaths.includes(path))
  
  return clearPaths.reduce((obj, path) => set(obj, path, undefined), parent) as TestResults
};

export const main = async () => {
  try {
    // Verify correct environment and request context
    requireEvent();
    requirePullNumber();
    await requirePr();

    // Collect the changes made in the given PR from base <-> head for eip files
    const files = await requireFiles();
    if (files.length !== 1) {
      throw "sorry only 1 file is supported right now";
    }
    const file = files[0] as File;

    // Collect errors for each file
    const dirtyTestResults = await testFile(file);
    // Apply independent purifiers
    const purifiedResults = [
      stateChangeAllowedPurifier(dirtyTestResults),
      editorApprovalPurifier(dirtyTestResults)
    ]
    // Purify the dirty results
    const testResults = innerJoinAncestors(dirtyTestResults, purifiedResults)

    const {errors: {
      fileErrors,
      authorErrors,
      headerErrors,
      approvalErrors
    },
      authors,
      fileDiff
    } = testResults; 

    const errors = [
      approvalErrors.isEditorApprovedError && fileErrors.filePreexistingError,
      fileErrors.validFilenameError,
      authorErrors?.hasAuthorsError,
      headerErrors?.constantEIPNumError,
      headerErrors?.constantStatusError,
      headerErrors?.validStatusError,
      headerErrors?.matchingEIPNumError,
      approvalErrors?.isAuthorApprovedError,
      fileErrors.filePreexistingError && approvalErrors.isEditorApprovedError
    ].filter(Boolean) as string[];

    // errors are truthy if they exist (are the error description)
    const shouldMerge =
      !fileErrors.filePreexistingError &&
      !fileErrors.validFilenameError &&
      !authorErrors?.hasAuthorsError &&
      !headerErrors?.constantEIPNumError &&
      !headerErrors?.validStatusError &&
      !headerErrors?.matchingEIPNumError &&
      !approvalErrors?.isAuthorApprovedError &&
      !headerErrors?.constantStatusError;

    if (
      fileErrors.filePreexistingError &&
      approvalErrors.isEditorApprovedError
    ) {
      const mentions = EIP_EDITORS.join(" ");
      await requestReviewers(EIP_EDITORS);
      await postComment(errors, mentions);
    } else if (authors) {
      const mentions = authors.join(" ");
      await requestReviewers(authors);
      await postComment(errors, mentions);
    } else {
      await postComment(errors);
    }
  } catch (error) {
    console.log(`An Exception Occured While Linting: \n${error}`);
    setFailed(error.message);
  }
};
