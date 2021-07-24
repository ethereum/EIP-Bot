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
    jest.spyOn(console, "warn").mockImplementation(() => {});
    jest.spyOn(console, "log").mockImplementation(() => {});
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

  describe("editor is also an author", () => {
    it("should require editor approval if an editor is also an author", async () => {
      process.env = envFactory({ PULL_NUMBER: MockedPullNumbers.PR3670 });
      await __MAIN_MOCK__();
      expect(setFailedMock).toHaveBeenCalledTimes(1);
    });
  });
});
