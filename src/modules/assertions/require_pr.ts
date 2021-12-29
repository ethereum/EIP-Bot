import { requirePullNumber } from "#/assertions";
import { PR } from "src/domain";
import { CriticalError } from "src/domain/exceptions";
import { github } from "src/infra";

export const requirePr = async (): Promise<PR> => {
  const prNum = requirePullNumber();
  const pr = await github.getPullRequestFromNumber(prNum);

  if (pr.merged && process.env.NODE_ENV !== "development") {
    throw new CriticalError(`PR ${prNum} is already merged; quitting`);
  }

  return pr;
};
