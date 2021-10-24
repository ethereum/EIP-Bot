import { context, getOctokit } from "@actions/github";
import { GITHUB_TOKEN, isDefined, PR } from "src/domain";
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

export const getRepoFilenameContent = (filename: string, sha: string) => {
  const Github = getOctokit(GITHUB_TOKEN).rest;
  return Github.repos
    .getContent({
      owner: context.repo.owner,
      repo: context.repo.repo,
      path: filename,
      ref: sha
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

export const resolveUserByEmail = async (email: string) => {
  const Github = getOctokit(GITHUB_TOKEN).rest;

  // @ts-ignore
  const { data: rawEmailSearch } = await Github.search.users({
    q: email
  })

  if (rawEmailSearch.total_count > 0 && rawEmailSearch.items[0] !== undefined) {
    return "@" + rawEmailSearch.items[0].login;
  }

  const { data: emailSearch } = await Github.search.users({
    q: `${email} in:email`
  });

  if (emailSearch.total_count === 1 && isDefined(emailSearch.items[0])) {
    return "@" + emailSearch.items[0].login;
  }

  const local = email.split("@")[0];
  if (!local) return;
  const firstName = local.split(".")[0];
  const lastName = local.split(".")[1];
  if (!firstName || !lastName) return;

  const { data: nameSearch } = await Github.search.users({
    q: `fullname:${firstName} ${lastName} type:users`
  });

  if (nameSearch.total_count === 1 && isDefined(nameSearch.items[0])) {
    return "@" + nameSearch.items[0].login;
  }

  return;
};
