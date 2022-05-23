import {
  requireEvent,
  requirePr
} from "#/assertions";
import { github } from "src/infra/github";

export const  requireMaxFileNumber = () => {
  const max_files_allowed = 100;
  requireEvent();
  const pr = requirePr();
  const files = github.getPullRequestFiles(pr.number);
  if ((files?.length) > max_files_allowed) {
    console.log(`Critical error: Number of PR Files > ${max_files_allowed}`);
    process.exit(1);
  }
  return 1;
};
