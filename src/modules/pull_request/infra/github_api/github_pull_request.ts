import { IGithubPullRequest } from "#/pull_request/domain/types";
import { GithubInfra } from "src/infra";
import { ChangeTypes, isDefined } from "src/domain";
import _ from "lodash";
import { PullRequestGithubApiLogs } from "#/pull_request/infra/github_api/log";

export class GithubPullRequest implements IGithubPullRequest {
  constructor(public github: GithubInfra, public logs: PullRequestGithubApiLogs) {}

  async postComment(message: string) {
    const me = await this.github.getSelf();
    const comments = await this.github.getContextIssueComments();

    // If comment already exists, update it
    for (const comment of comments) {
      if (comment.user?.login == me.login) {
        if (comment.body != message) {
          await this.github.updateComment(comment.id, message);
        }
        return;
      }
    }

    await this.github.createCommentOnContext(message);
  }

  async updateLabels(labels: ChangeTypes[]) {
    const currentRaw = await this.github.getContextLabels();
    // filters out unrelated tags so it doesn't change those
    const current = _.intersection(currentRaw, Object.values(ChangeTypes))
    const diff = _.xor(labels, currentRaw);

    if (_.isEmpty(diff)) {
      return this.logs.labelsMatch(current, labels)
    }

    const toRemove = _.intersection(current, diff);
    const toAdd = _.intersection(labels, diff);

    this.logs.labelsToBeChanged(current, labels, toAdd, toRemove);

    if (isDefined(toRemove)) {
      await this.github.removeLabels(toRemove)
    }

    if (isDefined(toAdd)) {
      await this.github.addLabels(toAdd)
    }
  }
}
