import "jest";
import actions from "@actions/github";
// import { Context } from "@actions/github/lib/context";
import { ALLOWED_STATUSES, EipStatus, EVENTS, PR } from "src/domain";
import {
  assertConstantEipNumber,
  assertConstantStatus,
  assertFilenameAndFileNumbersMatch,
  assertValidStatus,
  requireFiles,
  requirePr,
  requirePullNumber
} from "#/assertions";
import { clearContext, expectError } from "src/tests/testutils";
import { FileDiffFactory } from "src/tests/factories/fileDiffFactory";
import { FileFactory } from "src/tests/factories/fileFactory";

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
