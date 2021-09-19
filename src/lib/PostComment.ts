import { getOctokit } from "@actions/github";
import { context } from "@actions/github";
import { GITHUB_TOKEN } from "src/utils";

export const postComment = async (message: string) => {
  const Github = getOctokit(GITHUB_TOKEN).rest;

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
