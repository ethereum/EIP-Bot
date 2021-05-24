import { context, getOctokit } from "@actions/github";
import { GITHUB_TOKEN } from "src/utils";
import { requirePr } from "./Assertions";

export const getJustLogin = (author: string) => {
  if (author.startsWith("@")) {
    return author.slice(1);
  }
  return author;
};

/**
 * Attempts to request a review and returns a list of unchanged users
 * that were failed to request
 *
 * @param reviewers list of github handles or emails to request
 * @returns list of github handles or emails that failed to be requested
 * likely because they are not contributors in the EIPs repo
 */
export const requestReviewers = async (reviewers: string[]) => {
  const requestReview = async (reviewer: string) => {
    const Github = getOctokit(GITHUB_TOKEN);
    const pr = await requirePr();

    const res = await Github.pulls
      .requestReviewers({
        owner: context.repo.owner,
        repo: context.repo.repo,
        pull_number: pr.number,
        reviewers: [reviewer]
      })
      // if an error occurs return undefined
      .catch((err) => {});

    return !res && reviewer;
  };

  const requested = await Promise.all(reviewers.map(requestReview));
  return requested.filter(Boolean);
};

export const getApprovals = async () => {
  const pr = await requirePr();
  const Github = getOctokit(GITHUB_TOKEN);
  const { data: reviews } = await Github.pulls.listReviews({
    owner: context.repo.owner,
    repo: context.repo.repo,
    pull_number: pr.number
  });

  // Starting with set to prevent repeats
  const approvals: Set<string> = new Set();

  // Add PR author to approver list
  if (pr.user?.login) {
    approvals.add("@" + pr.user.login.toLowerCase());
  }

  // Only add approvals if the approver has a username
  for (const review of reviews) {
    const isApproval = review.state == "APPROVED";
    const reviewer = review.user?.login;
    if (isApproval && reviewer) {
      approvals.add("@" + reviewer.toLowerCase());
    }
  }

  return [...approvals];
};
