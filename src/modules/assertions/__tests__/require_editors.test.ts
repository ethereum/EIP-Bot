import {
  CORE_EDITORS,
  EIPCategory,
  ERC_EDITORS,
  EVENTS,
  FileDiff
} from "#domain";
import {
  mockDependency,
  mockGithubContext,
  mockedActual
} from "#tests/testutils";
import * as RequireEditors from "../require_editors";

const { _requireEIPEditors } = RequireEditors.__tests__;

describe("requireEIPEditors", () => {
  const requireEditorsPath = "#assertions/require_editors";
  const importRequireEditors = () => import("#assertions/require_editors")
  const importRequireEditorTests = () => import("#assertions/require_editors").then(res => res.__tests__);
  const actualRequireEIPEditors = mockedActual(
    importRequireEditors,
    "requireEIPEditors"
  );

  const coreEditorsMock = mockDependency("#domain", () => import("#domain"), "CORE_EDITORS");
  const ercEditorsMock = mockDependency("#domain", () => import("#domain"), "ERC_EDITORS");

  mockGithubContext({
    payload: { pull_request: { number: 1 } },
    repo: { repo: "repo", owner: "owner" },
    eventName: EVENTS.pullRequestTarget
  });

  const editors = ["editor1", "editor2", "editor3"];
  const requireAuthorsMock = jest.fn();
  const requireEIPEditors = _requireEIPEditors(requireAuthorsMock, editors);
  const consoleSpy = jest.spyOn(console, "warn");

  beforeEach(async () => {
    requireAuthorsMock.mockClear();
    consoleSpy.mockClear();
  });

  afterAll(() => {
    consoleSpy.mockReset();
  });

  it("should emit a console warning if no file diff is provided", () => {
    const res = requireEIPEditors();
    expect(res).toEqual(editors);
    expect(consoleSpy).toHaveBeenCalledTimes(1);
  });

  it("should return only editors that are not authors", () => {
    requireAuthorsMock.mockReturnValueOnce([editors[0]]);
    const res = requireEIPEditors({} as FileDiff);
    expect(res).toEqual([editors[1], editors[2]]);
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  it("should return all editors if none are authors", () => {
    requireAuthorsMock.mockReturnValueOnce(["not an author"]);
    const res = requireEIPEditors({} as FileDiff);
    expect(res).toEqual(editors);
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  it("should normalize editors to lowercase and no file diff provided", () => {
    const requireEIPEditors = _requireEIPEditors(
      requireAuthorsMock,
      editors.map((i) => i.toUpperCase())
    );
    const res = requireEIPEditors();
    expect(res).toEqual(editors);
  });

  it("should normalize editors to lowercase and file diff provided", () => {
    const requireEIPEditors = _requireEIPEditors(
      requireAuthorsMock,
      editors.map((i) => i.toUpperCase())
    );
    requireAuthorsMock.mockReturnValueOnce([editors[0]]);
    const res = requireEIPEditors({} as FileDiff);
    expect(res).toEqual([editors[1], editors[2]]);
  });

  describe("requireEditors", () => {
    const mock = mockDependency(requireEditorsPath, importRequireEditorTests, "_requireEIPEditors")

    it("should call erc if fileDiff is of type erc", async () => {
      const res = await actualRequireEIPEditors({
        base: { category: EIPCategory.erc }
      } as FileDiff);
      expect(ercEditorsMock.getMock()).toBeCalled();
    });
  })

});
