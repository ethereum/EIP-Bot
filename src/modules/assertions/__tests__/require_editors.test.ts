import { EIPCategory, EVENTS } from "#domain/Constants";
import { expectError, mockGithubContext } from "#tests/testutils";
import { RequireEditors as _RequireEditors } from "#assertions/require_editors";
import { CORE_EDITORS, ERC_EDITORS, FileDiff } from "#domain";
import { requireAuthors } from "#assertions/require_authors";

describe("_requireEIPEditors", () => {
  mockGithubContext({
    payload: { pull_request: { number: 1 } },
    repo: { repo: "repo", owner: "owner" },
    eventName: EVENTS.pullRequestTarget
  });

  const editors: [string, string, string] = ["editor1", "editor2", "editor3"];

  const RequireEIPEditors = new _RequireEditors({
    requireAuthors,
    ERC_EDITORS,
    CORE_EDITORS
  });
  const requireAuthorsSpy = jest.spyOn(RequireEIPEditors, "requireAuthors");
  const consoleSpy = jest.spyOn(console, "warn");

  beforeEach(async () => {
    requireAuthorsSpy.mockClear();
    consoleSpy.mockClear();
  });

  afterAll(() => {
    consoleSpy.mockReset();
  });

  it("should emit a console warning if no file diff is provided", () => {
    const res = RequireEIPEditors._requireEIPEditors(editors);
    expect(res).toEqual(editors);
    expect(consoleSpy).toHaveBeenCalledTimes(1);
  });

  it("should return only editors that are not authors", () => {
    requireAuthorsSpy.mockReturnValueOnce([editors[0]]);
    const res = RequireEIPEditors._requireEIPEditors(editors, {} as FileDiff);
    expect(res).toEqual([editors[1], editors[2]]);
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  it("should return all editors if none are authors", () => {
    requireAuthorsSpy.mockReturnValueOnce(["not an author"]);
    const res = RequireEIPEditors._requireEIPEditors(editors, {} as FileDiff);
    expect(res).toEqual(editors);
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  it("should normalize editors to lowercase and no file diff provided", () => {
    const res = RequireEIPEditors._requireEIPEditors(
      editors.map((editor) => editor.toUpperCase())
    );
    expect(res).toEqual(editors);
  });

  it("should normalize editors to lowercase and file diff provided", () => {
    requireAuthorsSpy.mockReturnValueOnce([editors[0]]);
    const res = RequireEIPEditors._requireEIPEditors(
      editors.map((i) => i.toUpperCase()),
      {} as FileDiff
    );
    expect(res).toEqual([editors[1], editors[2]]);
  });
});

describe("requireEditors", () => {
  mockGithubContext({
    payload: { pull_request: { number: 1 } },
    repo: { repo: "repo", owner: "owner" },
    eventName: EVENTS.pullRequestTarget
  });

  const editors: [string, string, string] = ["editor1", "editor2", "editor3"];

  const RequireEditors = new _RequireEditors({
    requireAuthors,
    ERC_EDITORS,
    CORE_EDITORS
  });
  RequireEditors._requireEIPEditors = jest.fn();
  RequireEditors.ERC_EDITORS = jest.fn();
  RequireEditors.CORE_EDITORS = jest.fn();

  const requireAuthorsSpy = jest.spyOn(RequireEditors, "requireAuthors");
  const consoleSpy = jest.spyOn(console, "warn");
  const methodNames = {
    [EIPCategory.erc]: "ERC_EDITORS",
    [EIPCategory.core]: "CORE_EDITORS"
  };
  const types = [EIPCategory.erc, EIPCategory.core];

  beforeEach(async () => {
    requireAuthorsSpy.mockReset();
    consoleSpy.mockClear();

    for (const method of Object.values(methodNames)) {
      RequireEditors[method].mockReset();
    }
  });

  for (const type of types) {
    it(`should call ${type} editor getter if fileDiff is of type ${type}`, () => {
      RequireEditors[methodNames[type]].mockReturnValue(editors);
      RequireEditors.requireEIPEditors({
        base: { category: type }
      } as FileDiff);
      expect(RequireEditors[methodNames[type]]).toBeCalled();
    });
  }

  it("should explode if no valid category is given", async () => {
    await expectError(() => {
      // @ts-expect-error this is on purpose
      RequireEditors.requireEIPEditors({
        base: { category: "fake category" }
      } as FileDiff);
    });
  });
});
