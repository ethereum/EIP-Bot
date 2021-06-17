import { setFailed } from "@actions/core";
import {
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
  EIP_EDITORS,
  File,
  TestResults
} from "./utils";
import { editorApprovalPurifier, innerJoinAncestors, stateChangeAllowedPurifier } from "./lib/Purifiers";

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
      authors
    } = testResults; 

    const errors = [
      fileErrors.filePreexistingError,
      fileErrors.validFilenameError,
      authorErrors?.hasAuthorsError,
      headerErrors?.constantEIPNumError,
      headerErrors?.constantStatusError,
      headerErrors?.validStatusError,
      headerErrors?.matchingEIPNumError,
      approvalErrors?.isAuthorApprovedError,
      approvalErrors.isEditorApprovedError
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

    if (shouldMerge) return;

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

    const message = `failed to pass tests with the following errors:\n\t- ${errors.join("\n\t- ")}`
    console.log(message);
    setFailed(message)
  } catch (error) {
    console.log(`An Exception Occured While Linting: \n${error}`);
    setFailed(error.message);
  }
};
