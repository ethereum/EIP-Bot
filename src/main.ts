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
import { processError } from "src/domain/exceptions";
import { multiLineString } from "#/utils";

const testFile = async (file: File): Promise<TestResults> => {
  // we need to define this here because the below logic can get very complicated otherwise
  const errors = DEFAULT_ERRORS;

  // file testing is not compatible (yet) with an initialy undefined file
  // so instead it's required here. It throws an exception for consistency
  const fileDiff = await getFileDiff(file);
  try {
    file = await requireFilePreexisting(file);
  } catch (err: any) {
    processError(err, {
      gracefulTermination: () => {
        throw err;
      },
      requirementViolation: (message) => {
        errors.fileErrors.filePreexistingError = message;
      },
      unexpectedError: () => {
        throw err;
      }
    });
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
  errors.fileErrors.validFilenameError = await assertValidFilename(file);
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

const getCommentMessage = (results: Results, header?: string) => {
  if (!results.length) return "There were no results cc @alita-moore";
  const comment: string[] = [];

  comment.push(header || COMMENT_HEADER);
  comment.push("---");
  for (const { filename, errors, successMessage } of results) {
    if (!errors) {
      comment.push(`## (pass) ${filename}`);
      const message = `\t` + (successMessage || "passed!");
      comment.push(message);
      continue;
    }

    comment.push(`## (fail) ${filename}`);
    for (const error of errors) {
      comment.push(`\t- ${error}`);
    }
  }
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
  let results: Results = [];
  for await (const file of files) {
    try {
      const res = await getFileTestResults(file);
      results.push(res);
    } catch (err: any) {
      processError(err, {
        gracefulTermination: (message) => {
          results.push({
            filename: file.filename,
            successMessage: message
          });
        },
        requirementViolation: (message) => {
          results.push({
            filename: file.filename,
            errors: [message]
          });
        },
        unexpectedError: (message, data) => {
          console.log(JSON.stringify(data, null, 2))
          message = `An unexpected error occurred (cc @alita-moore): ${message}`
          results.push({
            filename: file.filename,
            errors: [message]
          });
        }
      });
    }
  }

  if (!results.filter((res) => res.errors).length) {
    const commentMessage = getCommentMessage(
      results,
      "All tests passed; auto-merging..."
    );
    await postComment(commentMessage);
    console.log(commentMessage);
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
    const message = multiLineString("\n")(
      `A critical exception has occured:`,
      `\tMessage: '${error?.error || error}`,
      error?.data && `\tData:\n${JSON.stringify(error.data, null, 2)}`
    )
    console.log(message);
    setFailed(message);
    if (isProd) {
      await postComment(message);
    }
    throw message;
  }
};

export const _TESTS_ = {
  getEditorMentions,
  getAuthorMentions,
  _getMentions
};
