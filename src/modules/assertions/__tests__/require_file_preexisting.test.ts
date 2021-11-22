import {
  expectError,
  initGeneralTestEnv,
  mockGithubContext
} from "src/tests/testutils";
import { EVENTS } from "src/domain";
import { PRFactory } from "src/tests/factories/prFactory";
import { FileFactory } from "src/tests/factories/fileFactory";
import { RequireFilePreexisting } from "#/assertions/require_file_preexisting";

describe("require_file_preexisting", () => {
  mockGithubContext({
    payload: { pull_request: { number: 1 } },
    repo: { repo: "repo", owner: "owner" },
    eventName: EVENTS.pullRequestTarget
  });

  initGeneralTestEnv();

  const getContentMock = jest.fn();
  const requirePrMock = jest.fn();
  const RequireFilePreexistingInstance = new RequireFilePreexisting(
    requirePrMock,
    getContentMock
  );

  beforeEach(async () => {
    requirePrMock.mockReturnValue(Promise.resolve(await PRFactory()));
    getContentMock.mockReturnValue(Promise.resolve());
  });

  it("should return undefined if a file exists and is retrievable", async () => {
    const file = FileFactory();
    const res = await RequireFilePreexistingInstance.requireFilePreexisting(
      file
    );
    expect(res).toBe(file);
  });

  it("should throw error if github request returns 404", async () => {
    const file = FileFactory();
    getContentMock.mockReturnValueOnce(Promise.reject({ status: 404 }));
    await expectError(() =>
      RequireFilePreexistingInstance.requireFilePreexisting(file)
    );
  });

  it("should not throw error if github request does NOT return 404 (but still an error)", async () => {
    const file = FileFactory();
    getContentMock.mockReturnValueOnce(Promise.reject({ status: 403 }));
    const res = await RequireFilePreexistingInstance.requireFilePreexisting(
      file
    );
    expect(res).toBe(file);
  });

  it("should consider previous_filename", async () => {
    const file = FileFactory();
    file.previous_filename = "previous";
    file.filename = "now";

    await RequireFilePreexistingInstance.requireFilePreexisting(file);
    expect(getContentMock.mock.calls[0][0]).toEqual("previous");
  });

  it("should consider filename if previous_filename is undefined", async () => {
    const file = FileFactory();
    file.previous_filename = "";
    file.filename = "now";

    await RequireFilePreexistingInstance.requireFilePreexisting(file);
    expect(getContentMock.mock.calls[0][0]).toEqual("now");
  });

  it("should throw error if file status is `added`", async () => {
    const file = FileFactory();
    file.status = "added";
    await expectError(() =>
      RequireFilePreexistingInstance.requireFilePreexisting(file)
    );
  });
});
