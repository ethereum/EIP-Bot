import { IGithubPullRequest } from "#/pull_request/domain/types";
import { GithubInfra } from "src/infra";

export class GithubPullRequest implements IGithubPullRequest {
  constructor(public github: GithubInfra) {}

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
}
