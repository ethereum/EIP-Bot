import { setFailed } from "@actions/core";
import {
  // merge,
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
  FileDiff
} from "./utils";

const testFile = async (
  file: File
): Promise<ERRORS & { fileDiff?: FileDiff; authors?: string[] }> => {
  // we need to define this here because the below logic can get very complicated otherwise
  const errors = DEFAULT_ERRORS;

  // file testing is not compatible (yet) with an initialy undefined file
  // so instead it's required here. It throws an exception for consistency
  try {
    file = await requireFilePreexisting(file);
  } catch (err) {
    errors.fileErrors.filePreexistingError = err;
    errors.approvalErrors.isEditorApprovedError = await assertEIPEditorApproval(
      file
    );
    // new files are acceptable if an editor has approved
    if (errors.approvalErrors.isEditorApprovedError) {
      return errors;
    }
  }
  errors.fileErrors.validFilenameError = assertValidFilename(file);

  const fileDiff = await getFileDiff(file);
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
      ...errors,
      fileDiff
    };
  }

  errors.approvalErrors.isAuthorApprovedError = await assertIsApprovedByAuthors(
    fileDiff
  );
  return {
    ...errors,
    fileDiff,
    authors: requireAuthors(fileDiff)
  };
};

export const main = async () => {
  try {
    // Verify correct enviornment and request context
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
    const {
      fileErrors,
      authorErrors,
      headerErrors,
      approvalErrors,
      authors,
      fileDiff
    } = await testFile(file);

    const isStateChangeAllowed =
      fileDiff?.head.status === EipStatus.withdrawn ||
      (fileDiff?.base.status === EipStatus.lastCall &&
        fileDiff?.head.status === EipStatus.review);

    const errors = [
      approvalErrors.isEditorApprovedError && fileErrors.filePreexistingError,
      fileErrors.validFilenameError,
      authorErrors?.hasAuthorsError,
      headerErrors?.constantEIPNumError,
      !isStateChangeAllowed && headerErrors?.constantStatusError,
      !isStateChangeAllowed && headerErrors?.validStatusError,
      headerErrors?.matchingEIPNumError,
      approvalErrors?.isAuthorApprovedError,
      fileErrors.filePreexistingError && approvalErrors.isEditorApprovedError
    ].filter(Boolean) as string[];

    // errors are truthy if they exist (are the error description)
    const shouldMerge =
      (!approvalErrors.isEditorApprovedError ||
        !fileErrors.filePreexistingError) &&
      !fileErrors.validFilenameError &&
      !authorErrors?.hasAuthorsError &&
      !headerErrors?.constantEIPNumError &&
      !headerErrors?.validStatusError &&
      !headerErrors?.matchingEIPNumError &&
      !approvalErrors?.isAuthorApprovedError &&
      (isStateChangeAllowed || !headerErrors?.constantStatusError);

    console.log({ errors, shouldMerge });
    if (!shouldMerge) {
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

      if (!process.env.SHOULD_MERGE) {
        throw `would not have merged for the following reasons \n\t - ${errors.join(
          "\n\t - "
        )}`;
      }
    } else {
      // disabled initially to test behavior
      // return await merge(file);
    }
  } catch (error) {
    console.log(`An Exception Occured While Linting: \n${error}`);
    setFailed(error.message);
  }
};
