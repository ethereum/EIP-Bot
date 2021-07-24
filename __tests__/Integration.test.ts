// integration tests in this repo are previously fixed bugs
import { MockedPullNumbers } from "assets/records";
import { envFactory } from "__tests__/factories/envFactory";
import * as core from "@actions/core";
import { __MAIN_MOCK__ } from "assets/mockPR";
import MockedEnv from "mocked-env";

describe("integration testing edgecases associated with editors", () => {
  const setFailedMock = jest
    .fn()
    .mockImplementation(core.setFailed) as jest.MockedFunction<
    typeof core.setFailed
  >;
  const restore = MockedEnv(process.env);

  beforeAll(async () => {
    jest.spyOn(core, "setFailed").mockImplementation(setFailedMock);
  });

  beforeEach(async () => {
    jest.resetModules();
    const core = await import("@actions/core");
    jest.spyOn(core, "setFailed").mockImplementation(setFailedMock);
    setFailedMock.mockClear();
  });

  afterEach(() => {
    restore();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe("editor approval wasn't required if the author of the PR was an editor", () => {
    it("should require editor approval if an editor is also an author", async () => {
      process.env = envFactory({ PULL_NUMBER: MockedPullNumbers.PR3670 });
      await __MAIN_MOCK__();
      expect(setFailedMock).toHaveBeenCalledTimes(1);
    });
  });

  describe("editors weren't mentioned if there was only a valid status error", () => {
    it("should mention editors if there's a valid status error and no editor approval", async () => {
      process.env = envFactory({ PULL_NUMBER: MockedPullNumbers.PR3654 })

      // to be used later to check for mentions (postComment was an arbitrary choice)
      const lib = await import("src/lib/PostComment")
      const postCommentMock: jest.MockedFunction<typeof lib.postComment> = jest.fn().mockImplementation(lib.postComment);
      jest.spyOn(lib, "postComment").mockImplementation(postCommentMock)

      // constrain constants to prevent changes in state
      const constants = await import("src/utils/Constants");
      // @ts-expect-error
      constants.EIP_EDITORS =[
        "@MicahZoltu",
        "@lightclient"
      ]

      await __MAIN_MOCK__();

      // collect the call
      expect(postCommentMock).toHaveBeenCalledTimes(1)
      const call = postCommentMock.mock.calls[0]
      function assertDefined<T>(call: T): asserts call is NonNullable<T> {
        expect(call).toBeDefined();
      }
      assertDefined(call)

      expect(call[1]).toBe(constants.EIP_EDITORS.join(constants.MENTIONS_SEPARATOR))
    })
  })
});
