// integration tests in this repo are previously fixed bugs
import { SavedRecord } from "src/tests/assets/records";
import { envFactory } from "src/tests/factories/envFactory";
import * as core from "@actions/core";
import { __MAIN_MOCK__ } from "src/tests/assets/mockPR";
import MockedEnv from "mocked-env";
import nock from "nock";
import { PromiseValue } from "type-fest";
import { EIPCategory, EIPTypeOrCategoryToResolver, EIPTypes } from "src/domain";
import { assertDefined } from "src/domain/typeDeclaratives";

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
      process.env = envFactory({
        PULL_NUMBER: SavedRecord.PR3654_2,
        [EIPTypeOrCategoryToResolver[EIPTypes.informational]]:
          "@micahzoltu, @lighclient"
      });

      // to be used later to check for mentions (postComment was an arbitrary choice)
      jest.mock("#/components", () => ({
        ...jest.requireActual("#/components"),
        postComment: jest.fn().mockImplementation(() => {})
      }));

      await __MAIN_MOCK__();

      const Domain = await import("src/domain");
      const Components = (await import("#/components")) as jest.Mocked<
        PromiseValue<typeof import("#/components")>
      >;

      // collect the call
      expect(Components.postComment).toHaveBeenCalledTimes(1);
      const call = Components.postComment.mock.calls[0];

      function assertDefined<T>(call: T): asserts call is NonNullable<T> {
        expect(call).toBeDefined();
      }

      assertDefined(call);

      expect(call[0]).toContain(Domain.INFORMATIONAL_EDITORS()[0]);
      expect(call[0]).toContain(Domain.INFORMATIONAL_EDITORS()[1]);
    });

    it("should pass with editor approval", async () => {
      process.env = envFactory({
        PULL_NUMBER: SavedRecord.PR3654_1,
        [EIPTypeOrCategoryToResolver[EIPTypes.informational]]:
          "@micahzoltu, @lighclient"
      });

      jest.mock("src/domain", () => ({
        ...jest.requireActual("src/domain")
      }));

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

  describe("Pull 3581", () => {
    it("should pass", async () => {
      process.env = envFactory({
        PULL_NUMBER: SavedRecord.PR3581,
        [EIPTypeOrCategoryToResolver[EIPCategory.erc]]: "@lightclient"
      });

      await __MAIN_MOCK__();
      expect(setFailedMock).not.toBeCalled();
    });
    it("should not pass if no editor approval", async () => {
      process.env = envFactory({
        PULL_NUMBER: SavedRecord.PR3581
        // in this case I'm not setting the approver as an editor
      });

      await __MAIN_MOCK__();
      expect(setFailedMock).toHaveBeenCalled();
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

  // describe("Pull 4393", () => {
  //   it("should succeed", async () => {
  //     process.env = envFactory({
  //       PULL_NUMBER: SavedRecord.PR4393
  //     });
  //
  //     await __MAIN_MOCK__();
  //     expect(setFailedMock).toBeCalled();
  //   })
  // })

  // describe("Pull 4499", () => {
  //   it("should fail", async () => {
  //     process.env = envFactory({
  //       PULL_NUMBER: SavedRecord.PR4499
  //     });
  //
  //     await __MAIN_MOCK__();
  //     expect(setFailedMock).toBeCalled();
  //   })
  // })
});
