import { requirePullNumber } from "#/assertions";
import { getPullRequestFromNumber } from "src/infra";
import { PR } from "src/domain";
import { CriticalError } from "src/domain/exceptions";

export const requirePr = async (): Promise<PR> => {
  const prNum = requirePullNumber();
  const pr = await getPullRequestFromNumber(prNum);

  if (pr.merged && process.env.NODE_ENV !== "development") {
    throw new CriticalError(`PR ${prNum} is already merged; quitting`);
  }

  return pr;
};
