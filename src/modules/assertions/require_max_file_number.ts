import {
  requireEvent,
  requirePr
} from "#/assertions";
import { github } from "src/infra/github";

export const  requireMaxFileNumber = async (): Promise <1>  => {
  const max_files_allowed = 100;
  requireEvent();
  const pr = await requirePr();
  const files = await github.getPullRequestFiles(pr.number);
  if ((files?.length) > max_files_allowed) {
    console.log(`Critical error: Number of PR Files > ${max_files_allowed}`);
    process.exit(1);
  }
  return 1;
};
