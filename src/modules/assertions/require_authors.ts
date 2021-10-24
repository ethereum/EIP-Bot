import { FileDiff } from "src/domain";

/**
 * requires that authors exist and returns them else throw error
 *
 * @param file file diff of a given file
 * @returns list of raw author data
 */
export const requireAuthors = (fileDiff: FileDiff): string[] => {
  // take from base to avoid people adding themselves and being able to approve
  const authors = fileDiff.base.authors && [...fileDiff.base.authors];

  // Make sure there are authors
  if (!authors || authors.length === 0) {
    throw `${fileDiff.head.name} has no identifiable authors who can approve the PR (only considering the base version)`;
  }

  return authors;
};
