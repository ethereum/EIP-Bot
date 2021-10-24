import { getPullNumber } from "src/infra";

export const requirePullNumber = () => {
  const pullNumber = getPullNumber();

  if (!pullNumber) {
    throw "Build does not have a PR number associated with it; quitting...";
  }

  return pullNumber;
};
