import { setFailed } from "@actions/core";
import {
  requireFiles,
  requirePr,
  requireMaxFileNumber
} from "#/assertions";
import { PullRequestUseCases } from "#/pull_request/use_cases";
import {
  ChangeTypes,
  isNockDisallowedNetConnect,
  isNockNoMatchingRequest,
  isProd,
  MAINTAINERS,
  Results
} from "src/domain";
import _, { uniq } from "lodash";
import { requestReviewers } from "#/approvals";
import {
  getMaintainersString,
  getUnhandledErrorMessage,
  processError
} from "src/domain/exceptions";
import { multiLineString } from "#/utils";
import { testFile } from "#/main/modules/test_file";
import { purifyTestResults } from "#/main/modules/purify_test_results";
import { getCommentMessage } from "#/main/modules/get_comment_message";

export const _main_ = async () => {
  const pr = await requirePr();
  
  requireMaxFileNumber(pr);

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
          message = `An unexpected error occurred (cc ${MAINTAINERS().join(
            ", "
          )}): ${message}`;
          results.push({
            filename: file.filename,
            errors: [message],
            type: ChangeTypes.ambiguous
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
  try {
    return await _main_();
  } catch (error: any) {
    await processError(error, {
      critical: async (errMessage, data) => {
        const message = multiLineString("\n")(
          `A critical exception has occurred:`,
          `\tMessage: ${errMessage.toLowerCase()}`,
          data && `\tData:\n${JSON.stringify(data, null, 2)}`,
          getMaintainersString()
        );

        console.log(message);
        if (isProd()) {
          await PullRequestUseCases.postComment(message);
        }

        setFailed(message);
        throw message;
      },
      unhandled: async (error: any) => {
        // useful for making sure that auto-mocking can function (dev tool)
        if (
          isNockDisallowedNetConnect(error) ||
          isNockNoMatchingRequest(error)
        ) {
          throw error;
        }

        const message =
          getUnhandledErrorMessage(error) + getMaintainersString();

        console.log(message);
        if (isProd()) {
          await PullRequestUseCases.postComment(message);
        }

        setFailed(message);
        throw message;
      }
    });
  }
};

export const main = _main(_main_);
