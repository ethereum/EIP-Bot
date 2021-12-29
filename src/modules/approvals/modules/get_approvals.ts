import { requirePr } from "#/assertions";
import { github } from "src/infra";

/**
 * @returns the approvals of the pull request in context
 */
export const getApprovals = async () => {
  const pr = await requirePr();
  const reviews = await github.getPullRequestReviews(pr.number);

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
