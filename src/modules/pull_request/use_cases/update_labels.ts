import { GithubPullRequest } from "#/pull_request/infra/github_api/github_pull_request";
import { castTo, ChangeTypes } from "src/domain";
import { github } from "src/infra";
import { Logs } from "../infra/github_api/log";

const PullRequest = new GithubPullRequest(github, Logs);

export const updateLabels = castTo<
  (expectedLabels: ChangeTypes[]) => Promise<void>
>((args) => {
  return PullRequest.updateLabels(args);
});
