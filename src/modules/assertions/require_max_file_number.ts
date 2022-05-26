import { requireEvent } from "#/assertions";
import { PR } from "src/domain";
import { github } from "src/infra/github";

export const  requireMaxFileNumber = async (pr: PR) => {
  const max_files_allowed = 100;
  requireEvent();
  const files = await github.getPullRequestFiles(pr.number);
  if ((files?.length) > max_files_allowed) {
    console.log(`Critical error: Number of PR Files > ${max_files_allowed}`);
    process.exit(1);
  }
};
