import { __MAIN__ } from "src/utils";

import * as github from "src/utils/github";
import * as config from "src/utils/config";
import nock from "nock";

nock.disableNetConnect();

test("run should succeed with a repo and secret", async () => {
  // (github.listAllMatchingRepos as jest.Mock) = jest
  //   .fn()
  //   .mockImplementation(async () => [fixture[0].response]);

  // (github.setSecretForRepo as jest.Mock) = jest
  //   .fn()
  //   .mockImplementation(async () => null);

  // (secrets.getSecrets as jest.Mock) = jest.fn().mockReturnValue({
  //   BAZ: "bar"
  // });

  (config.getConfig as jest.Mock) = jest.fn().mockReturnValue({
    GITHUB_TOKEN: "token",
    SECRETS: ["BAZ"],
    REPOSITORIES: [".*"],
    REPOSITORIES_LIST_REGEX: true,
    DRY_RUN: false,
    RETRIES: 3,
    CONCURRENCY: 1
  });
  // await run();

  expect(github.listAllMatchingRepos as jest.Mock).toBeCalledTimes(1);
  // expect((github.setSecretForRepo as jest.Mock).mock.calls[0][3]).toEqual(
  //   fixture[0].response
  // );

  expect(process.exitCode).toBe(undefined);
});

describe("jest should run", () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules(); // Most important - it clears the cache
    process.env = { ...OLD_ENV }; // Make a copy
  });

  afterAll(() => {
    process.env = OLD_ENV; // Restore old environment
  });

  it("runs", async () => {
    await __MAIN__({
      GITHUB_TOKEN: "fake",
      NODE_ENV: "development",
      PULL_NUMBER: "6",
      BASE_SHA: "ded4fdfed04f6d5f486ec248ede66d6ba0546ef3",
      HEAD_SHA: "800fe8e8c47491dd2daab31256f4e48b358a7ba4",
      REPO_OWNER_NAME: "alita-moore",
      REPO_NAME: "EIPs",
      GITHUB_REPOSITORY: "alita-moore/EIPs"
    });
  });
});
