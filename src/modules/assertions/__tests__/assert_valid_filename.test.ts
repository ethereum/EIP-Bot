import { initGeneralTestEnv, mockGithubContext } from "src/tests/testutils";
import { EVENTS, File } from "src/domain";
import { FileFactory } from "src/tests/factories/fileFactory";
import { AssertValidFilename } from "#/assertions/assert_valid_filename";

describe("require_file_preexisting", () => {
  mockGithubContext({
    payload: { pull_request: { number: 1 } },
    repo: { repo: "repo", owner: "owner" },
    eventName: EVENTS.pullRequestTarget
  });

  initGeneralTestEnv();

  const requireFilenameEipNum = jest.fn();
  const _AssertValidFilename = new AssertValidFilename({
    requireFilenameEipNum
  });

  beforeEach(async () => {
    requireFilenameEipNum.mockReturnValue(Promise.resolve(1));
  });

  it("should return undefined if filename is valid", async () => {
    const file = FileFactory();
    const res = await _AssertValidFilename.assertValidFilename(file);
    expect(res).toBeUndefined();
  });

  it("should return defined if filename is not valid", async () => {
    const files = [
      FileFactory({ filename: "eip-123" }),
      FileFactory({ filename: "ep-123.md" }),
      FileFactory({ filename: "eip-a.md" }),
      FileFactory({ filename: "eip-123.js" })
    ];
    expect(
      await _AssertValidFilename.assertValidFilename(files[0] as File)
    ).toBeDefined();
    expect(
      await _AssertValidFilename.assertValidFilename(files[1] as File)
    ).toBeDefined();
    expect(
      await _AssertValidFilename.assertValidFilename(files[2] as File)
    ).toBeDefined();
    expect(
      await _AssertValidFilename.assertValidFilename(files[3] as File)
    ).toBeDefined();
  });
});
