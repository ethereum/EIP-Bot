import { _main } from "src/main";
import { expectError, initGeneralTestEnv } from "src/tests/testutils";
import * as core from "@actions/core";

describe("main (error handler)", () => {
  const _main_ = jest.fn();
  const main = _main(_main_);

  const setFailedMock = jest
    .fn()
    .mockImplementation(core.setFailed) as jest.MockedFunction<
    typeof core.setFailed
  >;

  beforeEach(() => {
    jest.spyOn(core, "setFailed").mockImplementation(setFailedMock);
    setFailedMock.mockClear();
  });

  initGeneralTestEnv();

  it("should set failed if exception", async () => {
    _main_.mockRejectedValue("error");
    await expectError(() => main());
    expect(setFailedMock).toBeCalledTimes(1);
  });
});
