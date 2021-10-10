import { context, getOctokit } from "@actions/github";
import { GITHUB_TOKEN, PR } from "#domain";
import { RequestError } from "@octokit/types";

export const getEventName = () => {
  return context.eventName;
};

export const getPullNumber = () => {
  return context.payload?.pull_request?.number;
};

export const getPullRequestFromNumber = (pullNumber: number) => {
  const github = getOctokit(GITHUB_TOKEN).rest;

  return github.pulls
    .get({
      repo: context.repo.repo,
      owner: context.repo.owner,
      pull_number: pullNumber
    })
    .then((res) => {
      return res.data;
    });
};

export const getPullRequestReviews = async (pullNumber: number) => {
  const Github = getOctokit(GITHUB_TOKEN).rest;
  const { data: reviews } = await Github.pulls.listReviews({
    owner: context.repo.owner,
    repo: context.repo.repo,
    pull_number: pullNumber
  });
  return reviews;
};

export const getPullRequestFiles = (pullNumber: number) => {
  const Github = getOctokit(GITHUB_TOKEN).rest;
  return Github.pulls
    .listFiles({
      pull_number: pullNumber,
      repo: context.repo.repo,
      owner: context.repo.owner
    })
    .then((res) => res.data);
};

export const getRepoFilenameContent = (filename: string, pr: PR) => {
  const Github = getOctokit(GITHUB_TOKEN).rest;
  return Github.repos
    .getContent({
      owner: context.repo.owner,
      repo: context.repo.repo,
      path: filename,
      ref: pr.base.sha
    })
    .then((res) => res.data)
    .catch((err) => err as RequestError);
};

export const requestReview = (pr: PR, reviewer: string) => {
  const Github = getOctokit(GITHUB_TOKEN).rest;
  return (
    Github.pulls
      .requestReviewers({
        owner: context.repo.owner,
        repo: context.repo.repo,
        pull_number: pr.number,
        reviewers: [reviewer]
      })
      // if an error occurs return undefined
      .catch((err) => {})
  );
};
