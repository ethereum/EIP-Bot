// integration tests in this repo are previously fixed bugs
import { SavedRecord } from "assets/records";
import { envFactory } from "__tests__/factories/envFactory";
import * as core from "@actions/core";
import { __MAIN_MOCK__ } from "assets/mockPR";
import MockedEnv from "mocked-env";
import nock from "nock";

describe("integration testing edgecases associated with editors", () => {
  const setFailedMock = jest
    .fn()
    .mockImplementation(core.setFailed) as jest.MockedFunction<
    typeof core.setFailed
  >;
  const restore = MockedEnv(process.env);

  beforeEach(async () => {
    jest.resetModules();
    const core = await import("@actions/core");
    jest.spyOn(core, "setFailed").mockImplementation(setFailedMock);
    setFailedMock.mockClear();
    nock.cleanAll();
  });

  afterEach(() => {
    restore();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe("Pull 3670", () => {
    it("should require editor approval if an editor is also an author", async () => {
      process.env = envFactory({ PULL_NUMBER: SavedRecord.PR3670 });
      await __MAIN_MOCK__();
      expect(setFailedMock).toHaveBeenCalledTimes(1);
    });
  });

  describe("Pull 3654", () => {
    it("should mention editors if there's a valid status error and no editor approval", async () => {
      process.env = envFactory({ PULL_NUMBER: SavedRecord.PR3654_2 });

      // to be used later to check for mentions (postComment was an arbitrary choice)
      const lib = await import("src/lib/PostComment");
      const postCommentMock: jest.MockedFunction<
        typeof lib.postComment
      > = jest.fn().mockImplementation(lib.postComment);
      jest.spyOn(lib, "postComment").mockImplementation(postCommentMock);

      // constrain constants to prevent changes in state
      const constants = await import("src/utils/Constants");
      // @ts-expect-error
      constants.EIP_EDITORS = ["@micahzoltu", "@lightclient"];

      await __MAIN_MOCK__();

      // collect the call
      expect(postCommentMock).toHaveBeenCalledTimes(1);
      const call = postCommentMock.mock.calls[0];
      function assertDefined<T>(call: T): asserts call is NonNullable<T> {
        expect(call).toBeDefined();
      }
      assertDefined(call);

      expect(call[0]).toContain(
        constants.EIP_EDITORS[0]
      );
      expect(call[0]).toContain(
        constants.EIP_EDITORS[1]
      );
    });

    it("should pass with editor approval", async () => {
      process.env = envFactory({ PULL_NUMBER: SavedRecord.PR3654_1 });

      // constrain constants to prevent changes in state
      const constants = await import("src/utils/Constants");

      // @ts-expect-error
      constants.EIP_EDITORS = [
        "@MicahZoltu", // capitalized
        "@lightclient"
      ];

      await __MAIN_MOCK__();

      expect(setFailedMock).not.toBeCalled();
    });
  });

  describe("Pull 3767", () => {
    it("should pass", async () => {
      process.env = envFactory({ PULL_NUMBER: SavedRecord.PR3767 });

      await __MAIN_MOCK__();
      expect(setFailedMock).not.toBeCalled();
    })
  })
});
