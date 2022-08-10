import {
  EIPCategory,
  EIPTypeOrCategoryToResolver,
  EIPTypes,
  EVENTS,
  INFORMATIONAL_EDITORS,
  INTERFACE_EDITORS,
  META_EDITORS,
  NETWORKING_EDITORS
} from "src/domain/Constants";
import { expectError, mockGithubContext } from "src/tests/testutils";
import { RequireEditors as _RequireEditors } from "#/assertions/require_editors";
import { CORE_EDITORS, ERC_EDITORS, FileDiff, EipStatus } from "src/domain";
import { FileDiffFactory } from "src/tests/factories/fileDiffFactory";

describe("_requireEIPEditors", () => {
  mockGithubContext({
    payload: { pull_request: { number: 1 } },
    repo: { repo: "repo", owner: "owner" },
    eventName: EVENTS.pullRequestTarget
  });

  const editors: [string, string, string] = ["editor1", "editor2", "editor3"];

  const RequireEIPEditors = new _RequireEditors({
    requireAuthors: jest.fn(),
    ERC_EDITORS,
    CORE_EDITORS,
    INFORMATIONAL_EDITORS,
    INTERFACE_EDITORS,
    META_EDITORS,
    NETWORKING_EDITORS
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

  const requireAuthors = jest.fn();
  const RequireEditors = new _RequireEditors({
    requireAuthors,
    ERC_EDITORS,
    CORE_EDITORS,
    INFORMATIONAL_EDITORS,
    INTERFACE_EDITORS,
    META_EDITORS,
    NETWORKING_EDITORS
  });
  const _requireEIPEditorsMock = jest.fn();
  RequireEditors._requireEIPEditors = _requireEIPEditorsMock;

  const requireAuthorsSpy = jest.spyOn(RequireEditors, "requireAuthors");
  const consoleSpy = jest.spyOn(console, "warn");

  const types = [EIPTypes.meta, EIPTypes.informational];

  const categories = [
    EIPCategory.erc,
    EIPCategory.core,
    EIPCategory.networking,
    EIPCategory.interface
  ];

  beforeEach(async () => {
    requireAuthorsSpy.mockReset();
    consoleSpy.mockClear();

    for (const method of Object.values(EIPTypeOrCategoryToResolver)) {
      RequireEditors[method] = jest.fn();
    }
  });

  for (const category of categories) {
    it(`should call ${category} editor getter if fileDiff is of category ${category}`, () => {
      RequireEditors[EIPTypeOrCategoryToResolver[category]].mockReturnValue(
        editors
      );
      RequireEditors.requireEIPEditors({
        base: { category }
      } as FileDiff);
      expect(
        RequireEditors[EIPTypeOrCategoryToResolver[category]]
      ).toBeCalled();
    });
  }

  for (const type of types) {
    it(`should call ${type} editor getter if fileDiff is of category ${type}`, () => {
      RequireEditors[EIPTypeOrCategoryToResolver[type]].mockReturnValue(
        editors
      );
      RequireEditors.requireEIPEditors({
        base: { type }
      } as FileDiff);
      expect(RequireEditors[EIPTypeOrCategoryToResolver[type]]).toBeCalled();
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

  it("should ignore category and return all editors if status is living", async () => {
    const fileDiff = FileDiffFactory({
      base: {
        // this should be ignored for eip 1
        category: EIPCategory.erc,
        status: EipStatus.living,
        filenameEipNum: 1234
      },
      head: {
        // only the status should be considered,
        status: EipStatus.draft,
        filenameEipNum: 1234
      }
    });

    _requireEIPEditorsMock.mockImplementation((input) => input);
    RequireEditors[
      EIPTypeOrCategoryToResolver[EIPCategory.erc]
    ].mockReturnValue(["@1"]);
    RequireEditors[
      EIPTypeOrCategoryToResolver[EIPCategory.core]
    ].mockReturnValue(["@2"]);
    const res = RequireEditors.requireEIPEditors(fileDiff);
    expect(res).toContainEqual("@1");
    expect(res).toContainEqual("@2");
  });
});
