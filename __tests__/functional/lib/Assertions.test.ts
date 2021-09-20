import "jest";
import actions from "@actions/github";
// import { Context } from "@actions/github/lib/context";
import { ALLOWED_STATUSES, EipStatus, EVENTS, FileDiff, PR } from "src/domain";
import {
  assertConstantEipNumber,
  assertConstantStatus,
  assertFilenameAndFileNumbersMatch,
  assertHasAuthors,
  assertValidFilename,
  assertValidStatus,
  requireAuthors,
  requireEvent,
  requireFilenameEipNum,
  requireFiles,
  requirePr,
  requirePullNumber,
  _requireEIPEditors,
  _requireFilePreexisting
} from "#assertions";
import { expectError, clearContext } from "__tests__/testutils";
import { FileDiffFactory } from "__tests__/factories/fileDiffFactory";
import { FileFactory } from "__tests__/factories/fileFactory";
import { PRFactory } from "__tests__/factories/prFactory";

jest.mock("@actions/github");

const { context, getOctokit } = require("@actions/github") as jest.Mocked<
  typeof actions
>;

describe("Requires", () => {
  beforeEach(() => {
    context.payload = { pull_request: { number: 1 } };
    // @ts-expect-error overload read-only for testing purposes
    context.repo = { repo: "repo", owner: "owner" };
    context.eventName = EVENTS.pullRequestTarget;
  });

  afterEach(() => {
    clearContext(context);
    getOctokit.mockClear();
  });

  describe("requireEvent", () => {
    it("should accept event type pull_request_target", () => {
      const event = requireEvent();
      expect(event).toBe(context.eventName);
    });

    it("should throw and error if event is not expected type", async () => {
      context.eventName = "";
      await expectError(requireEvent);
    });
  });

  describe("requirePullNumber", () => {
    it("should return pull request number", () => {
      const prNum = requirePullNumber();
      expect(prNum).toBe(1);
    });

    it("should error if there is no pull number", async () => {
      context.payload = {};
      await expectError(requirePullNumber);
    });
  });

  describe("requirePr", () => {
    const _pr = {
      merged: false
    };
    const get = jest.fn().mockResolvedValue({ data: _pr });
    beforeEach(() => {
      _pr.merged = false;
      getOctokit.mockReturnValueOnce({
        rest: {
          pulls: {
            // @ts-expect-error get is mocked and doesn't align
            get
          }
        }
      });
    });

    afterEach(() => {
      get.mockClear();
    });
    it("should return pull request", async () => {
      const pr = await requirePr();
      expect(pr).toBe(pr);
    });
    it("should call pulls.get with expected info", async () => {
      // @ts-expect-error intentionally not used
      const _ = await requirePr();
      expect(get.mock.calls[0][0]).toEqual({
        repo: context.repo.repo,
        owner: context.repo.owner,
        pull_number: context.payload.pull_request?.number
      });
    });
    it("should explode if the pr is merged", async () => {
      _pr.merged = true;
      await expectError(requirePr);
    });
    it("should not explode if merged and node_env development", async () => {
      _pr.merged = true;
      process.env.NODE_ENV = "development";

      const pr = await requirePr();
      expect(pr).toBeDefined();
    });
  });
  describe("requireAuthors", () => {
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

  describe("requireFilenameEipNum", () => {
    it("should not error if filename matches regex", () => {
      const eipNum = requireFilenameEipNum("eip-123.md");
      expect(eipNum).toBe(123);
    });
    it("should not explode if filename doesn't match", async () => {
      await expectError(() => requireFilenameEipNum("eip-123"));
      await expectError(() => requireFilenameEipNum("ep-123.md"));
      await expectError(() => requireFilenameEipNum("eip-a.md"));
      await expectError(() => requireFilenameEipNum("eip-123.js"));
    });
  });

  describe("requireFiles", () => {
    const mockFiles = [FileFactory()];
    const listFiles = jest
      .fn()
      .mockReturnValue(Promise.resolve({ data: mockFiles }));
    beforeEach(() => {
      getOctokit.mockReturnValue({
        rest: {
          pulls: {
            // @ts-expect-error listFiles is mocked so meant to be improper
            listFiles
          }
        }
      });
    });

    it("should call github and return files", async () => {
      const files = await requireFiles({ number: 1 } as PR);
      expect(files).toBe(mockFiles);
    });

    it("should explode if no files exist", async () => {
      listFiles.mockReturnValueOnce(Promise.resolve({ data: [] }));
      await expectError(() => requireFiles({ number: 1 } as PR));
    });
  });

  describe("requireFilePreexisting", () => {
    const getContent = jest.fn();
    const requirePr = jest.fn();
    const requireFilePreexisting = _requireFilePreexisting(requirePr);
    beforeEach(async () => {
      getOctokit.mockClear();
      requirePr.mockClear();
      getContent.mockClear();

      requirePr.mockReturnValue(Promise.resolve(await PRFactory()));
      getContent.mockReturnValue(Promise.resolve());
      getOctokit.mockReturnValue({
        rest: {
          repos: {
            // @ts-expect-error meant to error due to mock
            getContent
          }
        }
      });
    });

    it("should return undefined if a file exists and is retrievable", async () => {
      const file = FileFactory();
      const res = await requireFilePreexisting(file);
      expect(res).toBe(file);
    });

    it("should throw error if github request returns 404", async () => {
      const file = FileFactory();
      getContent.mockReturnValueOnce(Promise.reject({ status: 404 }));
      await expectError(() => requireFilePreexisting(file));
    });

    it("should not throw error if github request does NOT return 404 (but still an error)", async () => {
      const file = FileFactory();
      getContent.mockReturnValueOnce(Promise.reject({ status: 403 }));
      const res = await requireFilePreexisting(file);
      expect(res).toBe(file);
    });

    it("should consider previous_filename", async () => {
      const file = FileFactory();
      file.previous_filename = "previous";
      file.filename = "now";
      // @ts-expect-error intentionally unused to avoid multi-factor tests
      const _unused_ = await requireFilePreexisting(file);

      expect(getContent.mock.calls[0][0].path).toEqual("previous");
    });

    it("should consider filename if previous_filename is undefined", async () => {
      const file = FileFactory();
      file.previous_filename = "";
      file.filename = "now";
      // @ts-expect-error intentionally unused to avoid multi-factor tests
      const _unused_ = await requireFilePreexisting(file);

      expect(getContent.mock.calls[0][0].path).toEqual("now");
    });

    it("should throw error if file status is `added`", async () => {
      const file = FileFactory();
      file.status = "added";
      await expectError(() => requireFilePreexisting(file));
    });
  });

  describe("requireEIPEditors", () => {
    const editors = ["editor1", "editor2", "editor3"];
    const requireAuthorsMock = jest.fn();
    const requireEIPEditors = _requireEIPEditors(requireAuthorsMock, editors);
    const consoleSpy = jest.spyOn(console, "warn");

    beforeEach(() => {
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
  });
});

describe("Asserts", () => {
  beforeEach(() => {
    context.payload = { pull_request: { number: 1 } };
    // @ts-expect-error overload read-only for testing purposes
    context.repo = { repo: "repo", owner: "owner" };
    context.eventName = EVENTS.pullRequestTarget;
  });

  afterEach(() => {
    clearContext(context);
    getOctokit.mockClear();
  });

  describe("assertHasAuthors", () => {
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

  describe("assertValidFilename", () => {
    it("should return undefined if filename is valid", () => {
      const file = FileFactory();
      const res = assertValidFilename(file);
      expect(res).toBeUndefined();
    });

    it("should return defined if filename is not valid", () => {
      const files = [
        FileFactory({ filename: "eip-123" }),
        FileFactory({ filename: "ep-123.md" }),
        FileFactory({ filename: "eip-a.md" }),
        FileFactory({ filename: "eip-123.js" })
      ];
      // @ts-expect-error below is an invalid type error
      expect(assertValidFilename(files[0])).toBeDefined();
      // @ts-expect-error below is an invalid type error
      expect(assertValidFilename(files[1])).toBeDefined();
      // @ts-expect-error below is an invalid type error
      expect(assertValidFilename(files[2])).toBeDefined();
      // @ts-expect-error below is an invalid type error
      expect(assertValidFilename(files[3])).toBeDefined();
    });
  });

  describe("assertFilenameAndFileNumbersMatch", () => {
    it("should return undefined if the file names and headers match", () => {
      const fileDiff = FileDiffFactory();
      const res = assertFilenameAndFileNumbersMatch(fileDiff);
      expect(res).toBeUndefined();
    });
    it("returns an error if the numbers don't match in head", () => {
      const fileDiff = FileDiffFactory({
        head: { filenameEipNum: 1, eipNum: 2 }
      });
      const res = assertFilenameAndFileNumbersMatch(fileDiff);
      expect(res).toBeDefined();
    });

    it("does not return error if numbers don't match in base (base is assumed accurate)", () => {
      const fileDiff = FileDiffFactory({
        base: { filenameEipNum: 1, eipNum: 2 }
      });
      const res = assertFilenameAndFileNumbersMatch(fileDiff);
      expect(res).toBeUndefined();
    });
  });

  describe("assertConstantEipNumber", () => {
    it("should return nothing if the eip numbers haven't changed", () => {
      const fileDiff = FileDiffFactory();
      const res = assertConstantEipNumber(fileDiff);
      expect(res).toBeUndefined();
    });

    it("should return error message if only filename eip number changes", () => {
      const fileDiff = FileDiffFactory({
        base: { filenameEipNum: 1 },
        head: { filenameEipNum: 2 }
      });
      const res = assertConstantEipNumber(fileDiff);
      expect(res).toBeDefined();
    });

    it("should return error message if only header eip number changes", () => {
      const fileDiff = FileDiffFactory({
        base: { eipNum: 1 },
        head: { eipNum: 2 }
      });
      const res = assertConstantEipNumber(fileDiff);
      expect(res).toBeDefined();
    });

    it("should return error message if both header and filename eip number changes", () => {
      const fileDiff = FileDiffFactory({
        base: { eipNum: 1, filenameEipNum: 1 },
        head: { eipNum: 2, filenameEipNum: 2 }
      });
      const res = assertConstantEipNumber(fileDiff);
      expect(res).toBeDefined();
    });
  });

  describe("assertConstantStatus", () => {
    it("should return undefined if the status is constant", () => {
      const fileDiff = FileDiffFactory();
      const res = assertConstantStatus(fileDiff);
      expect(res).toBeUndefined();
    });

    it("should return error message if status is not constant", () => {
      const fileDiff = FileDiffFactory({
        head: { status: EipStatus.draft },
        base: { status: EipStatus.review }
      });
      const res = assertConstantStatus(fileDiff);
      expect(res).toBeDefined();
    });
  });

  describe("assertValidStatus", () => {
    const allStatuses = Object.values(EipStatus);
    const validStatuses = [...ALLOWED_STATUSES] as EipStatus[];
    const invalidStatuses = allStatuses.filter(
      (status) => !validStatuses.includes(status)
    );

    for (const status of validStatuses) {
      it(`should NOT return error if status is ${status} in the head commit`, () => {
        const fileDiff = FileDiffFactory({ head: { status } });
        const res = assertValidStatus(fileDiff);
        expect(res).toBeUndefined();
      });

      it(`should NOT return error if status is ${status} in the base commit`, () => {
        const fileDiff = FileDiffFactory({ base: { status } });
        const res = assertValidStatus(fileDiff);
        expect(res).toBeUndefined();
      });
    }

    for (const status of invalidStatuses) {
      it(`should return error if status is ${status} in the head commit`, () => {
        const fileDiff = FileDiffFactory({ head: { status } });
        const res = assertValidStatus(fileDiff);
        expect(res).toBeDefined();
      });

      it(`should return error if status is ${status} in the base commit`, () => {
        const fileDiff = FileDiffFactory({ base: { status } });
        const res = assertValidStatus(fileDiff);
        expect(res).toBeDefined();
      });
    }
  });
});
