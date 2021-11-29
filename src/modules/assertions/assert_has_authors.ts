import { FileDiff } from "src/domain";
import { IAssertHasAuthors } from "#/assertions/Domain/types";

export class AssertHasAuthors implements IAssertHasAuthors {
  constructor(){}
  assertHasAuthors = (file: FileDiff) => {
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
}
