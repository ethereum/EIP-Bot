import { setFailed } from "@actions/core";
import {
  requireEvent,
  requireFiles,
  requirePr,
  requirePullNumber
} from "#/assertions";
import { PullRequestUseCases } from "#/pull_request/use_cases";
import {
  ChangeTypes,
  isNockDisallowedNetConnect,
  isNockNoMatchingRequest,
  isProd,
  NodeEnvs,
  Results
} from "src/domain";
import { uniq } from "lodash";
import { requestReviewers } from "#/approvals";
import { processError } from "src/domain/exceptions";
import { multiLineString } from "#/utils";
import { testFile } from "#/main/modules/test_file";
import { purifyTestResults } from "#/main/modules/purify_test_results";
import { getCommentMessage } from "#/main/modules/get_comment_message";
import _ from "lodash";

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
      const dirtyTestResults = await testFile(file);
      const testResults = await purifyTestResults(dirtyTestResults);
      results.push(testResults);
    } catch (err: any) {
      processError(err, {
        gracefulTermination: (message) => {
          results.push({
            filename: file.filename,
            successMessage: message,
            type: ChangeTypes.ambiguous
          });
        },
        requirementViolation: (message) => {
          results.push({
            filename: file.filename,
            errors: [message],
            type: ChangeTypes.ambiguous
          });
        },
        unexpectedError: (message, data) => {
          console.log(JSON.stringify(data, null, 2));
          message = `An unexpected error occurred (cc @alita-moore): ${message}`;
          results.push({
            filename: file.filename,
            errors: [message],
            type: ChangeTypes.ambiguous
          });
        }
      });
    }
  }

  // updates labels to be as expected
  const expectedLabels = _.uniq(_.map(results, "type"));
  await PullRequestUseCases.updateLabels(expectedLabels)

  if (!results.filter((res) => res.errors).length) {
    const commentMessage = getCommentMessage(
      results,
      "All tests passed; auto-merging..."
    );
    await PullRequestUseCases.postComment(commentMessage);
    console.log(commentMessage);
    return;
  }

  const commentMessage = getCommentMessage(results);

  // to avoid annoying people, it's best to only do this while running prod
  if (isProd()) {
    await PullRequestUseCases.postComment(commentMessage);
    await requestReviewers(
      uniq(results.flatMap((res) => res.mentions).filter(Boolean) as string[])
    );
  }

  console.log(commentMessage);
  return setFailed(commentMessage);
};

export const _main = (_main_: () => Promise<undefined | void>) => async () => {
  const isProd = process.env.NODE_ENV === NodeEnvs.production;

  try {
    return await _main_();
  } catch (error: any) {
    if (isNockDisallowedNetConnect(error) || isNockNoMatchingRequest(error)) {
      throw error;
    }
    const message = multiLineString("\n")(
      `A critical exception has occurred (cc @alita-moore):`,
      `\tMessage: ${error.error || error.message?.toLowerCase()}`,
      error.data && `\tData:\n${JSON.stringify(error.data, null, 2)}`
    );
    console.log(message);

    if (isProd) {
      await PullRequestUseCases.postComment(message);
    }

    setFailed(message);

    throw message;
  }
};

export const main = _main(_main_);
