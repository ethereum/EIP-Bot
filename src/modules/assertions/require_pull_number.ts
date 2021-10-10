import { getPullNumber } from "#infra";

export const requirePullNumber = () => {
  const pullNumber = getPullNumber();

  if (!pullNumber) {
    throw "Build does not have a PR number associated with it; quitting...";
  }

  return pullNumber;
};
