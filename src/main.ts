import { setFailed } from "@actions/core";
import {
  // merge,
  postComment,
  requireEvent,
  assertFilePreexisting,
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
  assertValidStatus
} from "./lib";
import { EipStatus, ERRORS, File} from "./utils";

const testFile = async (file: File) => {
  const fileErrors = {
    filePreexisting: assertFilePreexisting(file),
    validFilename: assertValidFilename(file)
  };

  if (fileErrors.filePreexisting || fileErrors.validFilename) {
    return {
      fileErrors
    };
  }

  const fileDiff = await getFileDiff(file);

  const headerErrors = {
    matchingEIPNum: assertFilenameAndFileNumbersMatch(fileDiff),
    constantEIPNum: assertConstantEipNumber(fileDiff),
    constantStatus: assertConstantStatus(fileDiff),
    validStatus: assertValidStatus(fileDiff)
  };

  const authorErrors = {
    hasAuthors: assertHasAuthors(fileDiff)
  };

  if (authorErrors.hasAuthors) {
    return {
      fileErrors,
      headerErrors,
      authorErrors
    };
  }

  const approvalErrors = {
    isApproved: await assertIsApprovedByAuthors(fileDiff)
  };

  return {
    fileErrors,
    headerErrors,
    authorErrors,
    approvalErrors,
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
      (fileDiff?.base.status === EipStatus.lastCall && fileDiff?.head.status === EipStatus.review)

    const errors = [
      fileErrors.filePreexisting,
      fileErrors.validFilename,
      authorErrors?.hasAuthors,
      headerErrors?.constantEIPNum,
      !isStateChangeAllowed && headerErrors?.constantStatus,
      !isStateChangeAllowed && headerErrors?.validStatus,
      headerErrors?.matchingEIPNum,
      approvalErrors?.isApproved
    ].filter(Boolean) as string[];

    // errors are truthy if they exist (are the error description)
    const shouldMerge =
      !fileErrors.filePreexisting &&
      !fileErrors.validFilename &&
      !authorErrors?.hasAuthors &&
      !headerErrors?.constantEIPNum &&
      !headerErrors?.validStatus &&
      !headerErrors?.matchingEIPNum &&
      !approvalErrors?.isApproved &&
      (isStateChangeAllowed || !headerErrors?.constantStatus);

    if (!shouldMerge) {
      if (authors) {
        const mentions = authors.join(" ");
        await requestReviewers(authors);
        await postComment(errors, mentions)
      } else {
        await postComment(errors);
      }

      if (!process.env.SHOULD_MERGE) {
        throw `would not have merged for the following reasons ${errors.join("\n\t - ")}`;
      }
    } else {
      // disabled initially to test behavior
      // return await merge(file);
    }
  } catch (error) {
    console.error(error);
    ERRORS.push(`An Exception Occured While Linting: ${error}`);
    console.log(ERRORS);
    setFailed(error.message);
  }
};
