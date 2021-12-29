import { GithubPullRequest } from "#/pull_request/infra/github_api/github_pull_request";
import { castTo } from "src/domain";
import { github } from "src/infra";

const PullRequest = new GithubPullRequest(github);

export const postComment = castTo<(string) => Promise<void>>(
  (message: string) => {
    return PullRequest.postComment(message);
  }
);
