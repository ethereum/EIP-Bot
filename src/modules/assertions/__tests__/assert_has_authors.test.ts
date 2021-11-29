import { FileDiffFactory } from "src/tests/factories/fileDiffFactory";
import { assertHasAuthors } from "#/assertions";
import { initGeneralTestEnv, mockGithubContext } from "src/tests/testutils";
import { EVENTS } from "src/domain";

describe("assertHasAuthors", () => {
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

  it("should return undefined when assert succeeds", () => {
    const fileDiff = FileDiffFactory();
    const res = assertHasAuthors(fileDiff);
    // expect that no error occurs
    expect(res).toBeUndefined();
  });
  it("should return error if no authors", () => {
    const fileDiff = FileDiffFactory({
      head: { authors: new Set() },
      base: { authors: new Set() }
    });
    const res = assertHasAuthors(fileDiff);
    // expect that an error occurs
    expect(res).toBeDefined();
  });
  it("should only consider the authors at the base commit", () => {
    const fileDiff = FileDiffFactory({ head: { authors: new Set() } });
    const res = assertHasAuthors(fileDiff);
    // expect that no error occurs
    expect(res).toBeUndefined();
  });
});
