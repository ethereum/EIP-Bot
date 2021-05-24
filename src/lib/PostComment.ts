import { getOctokit } from "@actions/github";
import { context } from "@actions/github";
import { COMMENT_HEADER, GITHUB_TOKEN } from "src/utils";

export const postComment = async (errors: string[], mentions?: string) => {
  const Github = getOctokit(GITHUB_TOKEN);

  let message = COMMENT_HEADER + "\n\t - " + errors.join("\n\t - ");
  if (mentions) {
    message += `\n ${mentions}`;
  }

  const { data: me } = await Github.users.getAuthenticated();
  const { data: comments } = await Github.issues.listComments({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: context.issue.number
  });

  // If comment already exists, update it
  for (const comment of comments) {
    if (comment.user?.login == me.login) {
      if (comment.body != message) {
        Github.issues
          .updateComment({
            owner: context.repo.owner,
            repo: context.repo.repo,
            comment_id: comment.id,
            body: message
          })
          .catch((err) => {
            console.log(err);
          });
      }
      return;
    }
  }

  // else create a new one
  Github.issues.createComment({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: context.issue.number,
    body: message
  });
};
