import { PR } from "src/domain";
import { github } from "src/infra/github";

class TooManyFilesError extends Error {
  constructor(message) {
    super(message);
    this.name = "TooManyFilesError";
  }
}

export const  requireMaxFileNumber = async (pr: PR) => {
  const max_files_allowed = 25;
  const files = await github.getPullRequestFiles(pr.number);
  if ((files?.length) > max_files_allowed) {
    throw new TooManyFilesError(`Critical error: Number of PR Files > ${max_files_allowed}`);
  }
};
