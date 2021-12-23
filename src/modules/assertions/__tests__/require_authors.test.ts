import { FileDiffFactory } from "src/tests/factories/fileDiffFactory";
import { requireAuthors } from "#/assertions";
import {
  expectError,
  initGeneralTestEnv,
  mockGithubContext
} from "src/tests/testutils";
import { EVENTS } from "src/domain";

describe("requireAuthors", () => {
  initGeneralTestEnv();
  mockGithubContext({
    payload: {
      pull_request: {
        number: 1
      }
    },
    repo: { repo: "repo", owner: "owner" },
    eventName: EVENTS.pullRequestTarget
  });

  it("returns authors", () => {
    const fileDiff = FileDiffFactory();
    const authors = requireAuthors(fileDiff);
    // @ts-expect-error errors because authors can be undefined but it's not
    expect(authors).toEqual(Array.from(fileDiff.base.authors));
  });

  it("does not return head authors (only from base)", () => {
    const fileDiff = FileDiffFactory({
      head: { authors: new Set(["fake"]) }
    });
    const authors = requireAuthors(fileDiff);
    // @ts-expect-error errors because authors can be undefined but it's not
    expect(authors).toEqual(Array.from(fileDiff.base.authors));
  });

  it("explodes if no authors", () => {
    const fileDiff = FileDiffFactory({
      head: { authors: new Set() },
      base: { authors: new Set() }
    });
    expectError(() => requireAuthors(fileDiff));
  });
});
