import "jest";
import actions from "@actions/github";
// import { Context } from "@actions/github/lib/context";
import { EVENTS, Files, PR } from "src/utils";
import {
  assertHasAuthors,
  requireAuthors,
  requireEvent,
  requireFilenameEipNum,
  requireFiles,
  requirePr,
  requirePullNumber
} from "src/lib";
import {
  expectError,
  clearContext,
  FileDiffFactory,
  FileFactory
} from "__tests__/testutils";

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
    const get = jest.fn().mockReturnValue({ data: _pr });
    beforeEach(() => {
      _pr.merged = false;
      getOctokit.mockReturnValueOnce({
        pulls: {
          // @ts-expect-error get is mocked and doesn't align
          get
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
    })
    it("should not explode if filename doesn't match", async () => {
      await expectError(() => requireFilenameEipNum("eip-123"));
      await expectError(() => requireFilenameEipNum("ep-123.md"));
      await expectError(() => requireFilenameEipNum("eip-a.md"));
      await expectError(() => requireFilenameEipNum("eip-123.js"));
    })
  })

  describe("requireFiles", () => { 
    const mockFiles = [FileFactory()];
    const listFiles = jest.fn().mockReturnValue(Promise.resolve({ data: mockFiles}))
    beforeEach(() => {
      getOctokit.mockReturnValue({
        pulls: {
          // @ts-expect-error listFiles is mocked so meant to be improper
          listFiles
        }
      })
    })

    it("should call github and return files", async () => {
      const files = await requireFiles({ number: 1 } as PR)
      expect(files).toBe(mockFiles);
    })

    it("should explode if no files exist", async () => {
      listFiles.mockReturnValueOnce(Promise.resolve({data: []}))
      await expectError(() => requireFiles({number: 1} as PR));
    })
  })
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
});
