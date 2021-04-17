import { setFailed } from "@actions/core";
import { context, getOctokit } from "@actions/github";
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
import { CHECK_STATUS_INTERVAL, ERRORS, File, GITHUB_TOKEN } from "./utils";

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
    authors: requireAuthors(fileDiff)
  };
};

export const _main = async () => {
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
      authors
    } = await testFile(file);

    // TODO (alita): clean this up
    const shouldRequestReviews =
      !fileErrors.filePreexisting &&
      !fileErrors.validFilename &&
      !authorErrors?.hasAuthors &&
      !headerErrors?.constantEIPNum &&
      !headerErrors?.validStatus &&
      !headerErrors?.matchingEIPNum &&
      approvalErrors?.isApproved;
    if (shouldRequestReviews && authors) {
      await requestReviewers(authors);
    }

    // only acceptable error is changing status
    const shouldMerge = 
      !fileErrors.filePreexisting &&
      !fileErrors.validFilename &&
      !authorErrors?.hasAuthors &&
      !headerErrors?.constantEIPNum &&
      !headerErrors?.validStatus &&
      !headerErrors?.matchingEIPNum &&
      !approvalErrors?.isApproved;
    if (!shouldMerge) {
      const errors = [
        fileErrors.filePreexisting,
        fileErrors.validFilename,
        authorErrors?.hasAuthors,
        headerErrors?.constantEIPNum,
        headerErrors?.constantStatus,
        headerErrors?.validStatus,
        headerErrors?.matchingEIPNum,
        approvalErrors?.isApproved
      ].filter(Boolean) as string[];

      // TODO (alita): authors is implictly defined if shouldRequestReviews
      let mentions: string | undefined;
      if (shouldRequestReviews && authors) {
        mentions = authors.join(" ");
      }
      await postComment(errors, mentions);

      if (!process.env.SHOULD_MERGE) {
        throw "would not have merged";
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

// HACK (alita): check the CI status and only continue if the CI is successful
const checkCIStatus = async () => {
  const Github = getOctokit(GITHUB_TOKEN);
  const pr = await requirePr()
  const status = await Github.repos.getCombinedStatusForRef({
    owner: context.repo.owner,
    repo: context.repo.repo,
    ref: pr.head.ref
  }).then(res => res.data.state)

  console.log(`status is '${status}'...`)
  if (status === "failure") {
    setFailed("CI checks failed; bot can only merge if CI checks pass")
  }

  return status === "success";
}

export const pauseInterval = (checker, next, timeout) => async () => {
  const status = await checker();
  if (!status) {
    setTimeout(pauseInterval(checker, next, timeout), timeout);
  } else {
    return next()
  }
}

// only runs the bot if the CI statuses pass; checks every 30 seconds
export const main = pauseInterval(checkCIStatus, _main, CHECK_STATUS_INTERVAL)
