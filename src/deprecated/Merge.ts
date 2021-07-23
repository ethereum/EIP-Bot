import { getOctokit, context } from "@actions/github";
import { FileDiff, GITHUB_TOKEN, MERGE_MESSAGE } from "src/utils";
import { requirePr } from "../lib/Assertions";

export const merge = async (diff: FileDiff) => {
  const pr = await requirePr();
  const Github = getOctokit(GITHUB_TOKEN);
  const eipNum = diff.head.eipNum;

  const { MERGE_ENABLED } = process.env;
  if (!MERGE_ENABLED) {
    const message = [
      `PR would have been merged but wasn't because env variable`,
      `ENABLE_MERGE has either not been set or is deliberately false`
    ].join(" ");
    console.log(message);
    return message;
  }

  await Github.pulls.merge({
    pull_number: pr.number,
    repo: context.repo.repo,
    owner: context.repo.owner,
    commit_title: `Automatically merged updates to ${diff.head.status} EIP(s) ${eipNum} (#${pr.number})`,
    commit_message: MERGE_MESSAGE,
    merge_method: "squash",
    sha: pr.head.sha
  });

  return {
    response: `Merging PR ${pr.number}!`
  };
};
