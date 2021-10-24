import { setFailed } from "@actions/core";
import {
  assertConstantEipNumber,
  assertConstantStatus,
  assertEIP1EditorApprovals,
  assertEIPEditorApproval,
  assertFilenameAndFileNumbersMatch,
  assertHasAuthors,
  assertIsApprovedByAuthors,
  assertValidFilename,
  assertValidStatus,
  requireAuthors,
  requireEIPEditors,
  requireEvent,
  requireFilePreexisting,
  requireFiles,
  requirePr,
  requirePullNumber
} from "#/assertions";
import {
  editorApprovalPurifier,
  EIP1Purifier,
  getAllTruthyObjectPaths,
  innerJoinAncestors,
  postComment,
  statusChangeAllowedPurifier
} from "#/components";
import {
  COMMENT_HEADER,
  DEFAULT_ERRORS,
  File,
  NodeEnvs,
  Results,
  TestResults
} from "src/domain";
import { get, uniq } from "lodash";
import { requestReviewers } from "#/approvals";
import { getFileDiff } from "#/file";

const testFile = async (file: File): Promise<TestResults> => {
  // we need to define this here because the below logic can get very complicated otherwise
  const errors = DEFAULT_ERRORS;

  // file testing is not compatible (yet) with an initialy undefined file
  // so instead it's required here. It throws an exception for consistency
  const fileDiff = await getFileDiff(file);
  try {
    file = await requireFilePreexisting(file);
  } catch (err: any) {
    errors.fileErrors.filePreexistingError = err;
    errors.approvalErrors.isEditorApprovedError = await assertEIPEditorApproval(
      fileDiff
    );
    // new files are acceptable if an editor has approved
    if (errors.approvalErrors.isEditorApprovedError) {
      return {
        errors,
        fileDiff
      };
    }
  }

  errors.approvalErrors.isEditorApprovedError = await assertEIPEditorApproval(
    fileDiff
  );
  errors.approvalErrors.enoughEditorApprovalsForEIP1Error =
    await assertEIP1EditorApprovals(fileDiff);
  errors.fileErrors.validFilenameError = assertValidFilename(file);
  errors.headerErrors.matchingEIPNumError =
    assertFilenameAndFileNumbersMatch(fileDiff);
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

const getEditorMentions = (testResults: TestResults) => {
  const {
    errors: { fileErrors, approvalErrors, headerErrors },
    fileDiff
  } = testResults;

  const editors = requireEIPEditors(fileDiff);

  // new eips require editor approval
  if (fileErrors.filePreexistingError && approvalErrors.isEditorApprovedError) {
    return editors;
  }

  // eip1 requires more than 1 editor approval
  if (approvalErrors.enoughEditorApprovalsForEIP1Error) {
    return editors;
  }

  // valid status errors require editor approval
  if (headerErrors.validStatusError && approvalErrors.isEditorApprovedError) {
    return editors;
  }

  return;
};

const getAuthorMentions = (testResults: TestResults) => {
  const {
    errors: { approvalErrors },
    authors
  } = testResults;

  if (authors && approvalErrors.isAuthorApprovedError) {
    return authors;
  }

  return;
};

const _getMentions =
  (
    _getEditorMentions: typeof getEditorMentions,
    _getAuthorMentions: typeof getAuthorMentions
  ) =>
  (testResults: TestResults) => {
    const editorMentions = _getEditorMentions(testResults);
    const authorMentions = _getAuthorMentions(testResults);
    // filtering Boolean prevents trailing space
    return [editorMentions, authorMentions].flat().filter(Boolean) as string[];
  };

const getMentions = _getMentions(getEditorMentions, getAuthorMentions);

const getCommentMessage = (results: Results) => {
  if (!results.length) return "There were no results";
  const comment: string[] = [];

  comment.push(COMMENT_HEADER);
  comment.push("---");
  for (const { filename, errors } of results) {
    comment.push(`## ${filename}`);
    if (!errors) {
      comment.push(`\t passed!`);
      continue;
    }

    for (const error of errors) {
      comment.push(`- ${error}`);
    }
  }
  7;
  return comment.join("\n");
};

const getFileTestResults = async (file: File) => {
  // Collect errors for each file
  const dirtyTestResults = await testFile(file);
  // Apply independent purifiers
  const primedPurifiers = [
    statusChangeAllowedPurifier(dirtyTestResults),
    editorApprovalPurifier(dirtyTestResults),
    EIP1Purifier(dirtyTestResults)
  ];
  // Purify the dirty results
  const testResults = innerJoinAncestors(dirtyTestResults, primedPurifiers);
  const errors: string[] = getAllTruthyObjectPaths(testResults.errors).map(
    (path) => get(testResults.errors, path)
  );

  if (errors.length === 0) {
    console.log(`${testResults.fileDiff.base.name} passed!`);
    return {
      filename: testResults.fileDiff.base.name
    };
  }

  // collect mentions and post message comment
  const mentions = getMentions(testResults);
  return {
    filename: testResults.fileDiff.base.name,
    errors,
    mentions
  };
};

export const _main_ = async () => {
  // Verify correct environment and request context
  requireEvent();
  requirePullNumber();
  const pr = await requirePr();

  // Collect the changes made in the given PR from base <-> head for eip files
  const files = await requireFiles(pr);
  const results: Results = await Promise.all(files.map(getFileTestResults));

  if (!results.filter((res) => res.errors).length) {
    await postComment("All tests passed; auto-merging...");
    console.log("All tests passed; auto-merging...");
    return;
  }

  const commentMessage = getCommentMessage(results);
  await postComment(commentMessage);
  await requestReviewers(
    uniq(results.flatMap((res) => res.mentions).filter(Boolean) as string[])
  );

  console.log(commentMessage);
  return setFailed(commentMessage);
};

export const main = async () => {
  const isProd = process.env.NODE_ENV === NodeEnvs.production;

  try {
    return await _main_();
  } catch (error: any) {
    console.log(`An Exception Occured While Linting: \n${error}`);
    setFailed(error.message);
    if (isProd) {
      await postComment(error.message);
    }
    throw error;
  }
};

export const _TESTS_ = {
  getEditorMentions,
  getAuthorMentions,
  _getMentions
};
