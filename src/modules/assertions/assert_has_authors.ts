import { FileDiff } from "src/domain";

/**
 * assert that authors exist for the EIP at the PRs base commit
 *
 * @param file file diff of a given file
 * @returns list of raw author data
 */
export const assertHasAuthors = (file: FileDiff) => {
  // take from base to avoid people adding themselves and being able to approve
  const authors = file.base.authors && [...file.base.authors];

  // Make sure there are authors
  if (!authors || authors.length === 0) {
    return [
      `${file.head.name} has no identifiable authors who`,
      `can approve the PR (only considering the base version)`
    ].join(" ");
  } else return;
};
