import { getOctokit, context } from "@actions/github";
import { FileDiff, GITHUB_TOKEN, MERGE_MESSAGE } from "src/utils";
import { requirePr } from "./Assertions";

export const merge = async (diffs: FileDiff[]) => {
  const pr = await requirePr();
  const Github = getOctokit(GITHUB_TOKEN);
  const eips = diffs.map((diff) => diff.head.eipNum);
  const eipNumbers = eips.join(", ");

  const { SHOULD_MERGE, NODE_ENV } = process.env;
  if (!SHOULD_MERGE || !NODE_ENV) {
    return {
      response: [
        `PR would have been merged but wasn't because env variable`,
        `SHOULD_MERGE has either not been set or is deliberately false`
      ].join(" ")
    };
  }

  await Github.pulls.merge({
    pull_number: pr.number,
    repo: context.repo.repo,
    owner: context.repo.owner,
    commit_title: `Automatically merged updates to draft EIP(s) ${eipNumbers} (#${pr.number})`,
    commit_message: MERGE_MESSAGE,
    merge_method: "squash",
    sha: pr.head.sha
  });

  return {
    response: `Merging PR ${pr.number}!`
  };
};
