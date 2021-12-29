import { CriticalError } from "src/domain/exceptions";
import { github } from "src/infra";

export const requirePullNumber = () => {
  const pullNumber = github.getPullNumber();

  if (!pullNumber) {
    throw new CriticalError(
      "Build does not have a PR number associated with it; quitting..."
    );
  }

  return pullNumber;
};
