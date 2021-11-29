import { FileDiff } from "src/domain";
import { RequirementViolation } from "src/domain/exceptions";
import { IRequireAuthors } from "#/assertions/Domain/types";

export class RequireAuthors implements IRequireAuthors {
  constructor() {}

  requireAuthors = (fileDiff: FileDiff): string[] => {
    // take from base to avoid people adding themselves and being able to approve
    const authors = fileDiff.base.authors && [...fileDiff.base.authors];

    // Make sure there are authors
    if (!authors || authors.length === 0) {
      throw new RequirementViolation(
        `${fileDiff.head.name} has no identifiable authors who can approve the PR (only considering the base version)`
      );
    }

    return authors;
  };
}
