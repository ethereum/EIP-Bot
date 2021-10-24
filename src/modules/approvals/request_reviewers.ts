import { isDefined } from "src/domain";
import { requirePr } from "#/assertions";
import { requestReview } from "src/infra";

/**
 * Attempts to request a review and returns a list of unchanged users
 * that were failed to request
 *
 * @param reviewers list of github handles or emails to request
 * @returns list of github handles or emails that failed to be requested
 * likely because they are not contributors in the EIPs repo
 */
export const requestReviewers = async (reviewers: string[]) => {
  const pr = await requirePr();
  const requestReviewer = async (reviewer: string) => {
    const res = await requestReview(pr, reviewer);
    return !res && reviewer;
  };

  const requested = await Promise.all(reviewers.map(requestReviewer));
  return requested.filter(isDefined);
};
