// integration tests in this repo are previously fixed bugs
import { SavedRecord } from "src/tests/assets/records";
import { envFactory } from "src/tests/factories/envFactory";
import { __MAIN_MOCK__, mockPR } from "src/tests/assets/mockPR";
import { EIPCategory, EIPTypeOrCategoryToResolver, EIPTypes } from "src/domain";
import { assertDefined } from "src/domain/typeDeclaratives";
import { github } from "src/infra";
import { RequireFilenameEIPNum } from "#/assertions/require_filename_eip_num";
import { getApprovals } from "#/approvals";
import { getParsedContent } from "#/file/modules/get_parsed_content";
import { Exceptions } from "src/domain/exceptions";
import { getSetFailedMock, initGeneralTestEnv } from "src/tests/testutils";

const getPullRequestFiles = github.getPullRequestFiles;

describe("integration testing edgecases associated with editors", () => {
  initGeneralTestEnv();
  const setFailedMock = getSetFailedMock();

  describe("Pull 3654", () => {
    it("should mention editors if there's a valid status error and no editor approval", async () => {
      process.env = envFactory({
        PULL_NUMBER: SavedRecord.PR3654_2,
        [EIPTypeOrCategoryToResolver[EIPTypes.informational]]:
          "@micahzoltu, @lighclient"
      });

      await __MAIN_MOCK__();
      const Domain = await import("src/domain");

      // collect the call
      expect(setFailedMock).toHaveBeenCalledTimes(1);
      const call = setFailedMock.mock.calls[0];

      expect(call).toBeDefined();
      expect(call![0]).toContain(Domain.INFORMATIONAL_EDITORS()[0]);
      expect(call![0]).toContain(Domain.INFORMATIONAL_EDITORS()[1]);
    });

    it("should pass with editor approval", async () => {
      process.env = envFactory({
        PULL_NUMBER: SavedRecord.PR3654_1,
        [EIPTypeOrCategoryToResolver[EIPTypes.informational]]:
          "@micahzoltu, @lighclient"
      });

      await __MAIN_MOCK__();
      expect(setFailedMock).not.toBeCalled();
    });
  });

  describe("Pull 3767", () => {
    it("should pass", async () => {
      process.env = envFactory({ PULL_NUMBER: SavedRecord.PR3767 });

      await __MAIN_MOCK__();
      expect(setFailedMock).not.toBeCalled();
    });
  });

  describe("Pull 3612", () => {
    it("should pass", async () => {
      process.env = envFactory({ PULL_NUMBER: SavedRecord.PR3612 });

      await __MAIN_MOCK__();
      expect(setFailedMock).not.toBeCalled();
    });
  });

  describe("Pull 4192", () => {
    it("should not pass either files", async () => {
      process.env = envFactory({ PULL_NUMBER: SavedRecord.PR4192 });

      await __MAIN_MOCK__();
      expect(setFailedMock).toBeCalled();
      const call = setFailedMock.mock.calls[0] as NonNullable<
        typeof setFailedMock.mock.calls[0]
      >;
      expect(call[0]).not.toMatch(/passed/);
    });

    it("should mention multiple expected files", async () => {
      process.env = envFactory({ PULL_NUMBER: SavedRecord.PR4192 });

      await __MAIN_MOCK__();
      expect(setFailedMock).toBeCalled();
      const call = setFailedMock.mock.calls[0] as NonNullable<
        typeof setFailedMock.mock.calls[0]
      >;
      expect(call[0]).toMatch(/eip-1010.md/);
      expect(call[0]).toMatch(/eip-1056.md/);
    });
  });

  describe("Pull 3768", () => {
    it("(variant 1) should pass", async () => {
      process.env = envFactory({
        PULL_NUMBER: SavedRecord.PR3768_1,
        [EIPTypeOrCategoryToResolver[EIPCategory.erc]]: "@micahzoltu"
      });

      await __MAIN_MOCK__();
      expect(setFailedMock).not.toBeCalled();
    });

    it("(variant 2) should fail", async () => {
      process.env = envFactory({
        PULL_NUMBER: SavedRecord.PR3768_2,
        [EIPTypeOrCategoryToResolver[EIPCategory.erc]]: "@micahzoltu"
      });

      await __MAIN_MOCK__();
      expect(setFailedMock).toBeCalled();
    });

    it("should not mention authors with emails", async () => {
      process.env = envFactory({
        PULL_NUMBER: SavedRecord.PR3768_2,
        [EIPTypeOrCategoryToResolver[EIPCategory.erc]]: "@micahzoltu"
      });

      await __MAIN_MOCK__();
      const call = setFailedMock.mock.calls[0];
      expect(call).toBeDefined();
      assertDefined(call);
      expect(call[0]).not.toMatch(/dete@axiomzen.co/);
    });
  });

  describe("Pull 3623", () => {
    it("should pass", async () => {
      process.env = envFactory({
        PULL_NUMBER: SavedRecord.PR3623,
        [EIPTypeOrCategoryToResolver[EIPCategory.erc]]: "@micahzoltu"
      });

      await __MAIN_MOCK__();
      expect(setFailedMock).not.toBeCalled();
    });
  });

  describe("Pull 4189", () => {
    it("should pass", async () => {
      process.env = envFactory({
        PULL_NUMBER: SavedRecord.PR4189
      });

      await __MAIN_MOCK__();
      expect(setFailedMock).not.toBeCalled();
    });
  });

  describe("Pull 4478", () => {
    it("should fail", async () => {
      process.env = envFactory({
        PULL_NUMBER: SavedRecord.PR4478
      });

      await __MAIN_MOCK__();
      expect(setFailedMock).toBeCalled();
    });
  });

  describe("Pull 4506", () => {
    it("should fail", async () => {
      process.env = envFactory({
        PULL_NUMBER: SavedRecord.PR4506
      });

      await __MAIN_MOCK__();
      expect(setFailedMock).toBeCalled();
    });

    it("should fail gracefully on assets/eip-3448/MetaProxyFactory.sol", async () => {
      process.env = envFactory({
        PULL_NUMBER: SavedRecord.PR4506
      });

      const PR = await mockPR(SavedRecord.PR4506);
      const _RequireFilenameEIPNum = new RequireFilenameEIPNum({
        getPullRequestFiles: getPullRequestFiles,
        requirePr: jest.fn().mockResolvedValue(PR),
        requireEIPEditors: jest.fn().mockReturnValue(["@editor1", "@editor2"]),
        getApprovals: getApprovals,
        getParsedContent: getParsedContent
      });

      const exceptionType = await _RequireFilenameEIPNum
        .requireFilenameEipNum("assets/eip-3448/MetaProxyFactory.sol")
        .catch((err) => err.type);
      expect(exceptionType).toBe(Exceptions.gracefulTermination);
    });
  });

  describe("Pull 4499", () => {
    it("should fail", async () => {
      process.env = envFactory({
        PULL_NUMBER: SavedRecord.PR4499
      });

      const Exceptions = await import("src/domain/exceptions");
      const requirementViolationMock = jest.spyOn(
        Exceptions,
        "RequirementViolation"
      );

      await __MAIN_MOCK__();
      expect(setFailedMock).toBeCalled();

      expect(requirementViolationMock).not.toBeCalled();
    });
  });

  describe("Pull 4361", () => {
    it("should succeed", async () => {
      process.env = envFactory({
        PULL_NUMBER: SavedRecord.PR4361,
        ERC_EDITORS: "@lightclient,@axic"
      });

      await __MAIN_MOCK__();
      expect(setFailedMock).not.toBeCalled();
    })
  })
});
