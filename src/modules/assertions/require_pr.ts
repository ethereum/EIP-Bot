import { requirePullNumber } from "#assertions";
import { getPullRequestFromNumber } from "#infra";

export const requirePr = async () => {
  const prNum = requirePullNumber();
  const pr = await getPullRequestFromNumber(prNum);

  if (pr.merged && process.env.NODE_ENV !== "development") {
    throw `PR ${prNum} is already merged; quitting`;
  }

  return pr;
};
