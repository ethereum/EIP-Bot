import nock from "nock";
import { NodeEnvs, PR } from "src/utils";
import MockRecords from "./records";

const baseUrl = "https://api.github.com";
const scope = nock(baseUrl).persist();

/**
 * This is a tool used to mock pull requests, this is useful for testing and it's also
 * useful for development. It makes dealing with merged PRs trivial because if you change
 * the mocked requests in its respective asset file then you can simulate situations
 *
 * @param pullNumber the pull number to mock (mocks the necesary github api requests)
 * @returns mocked pull request of the pull number
 */
export const mockPR = (pullNumber: number) => {
  const records = MockRecords[`PR${pullNumber}`];

  if (!records)
    throw new Error(`no mocked records for pull number ${pullNumber}`);
  for (const record of records) {
    const req = record.req;
    const res = record.res;
    const wildcard = req.url.replace(baseUrl, "");

    switch (req.method) {
      case "GET":
        scope.get(wildcard).reply(res.status, res.data);
      case "POST":
        scope.post(wildcard).reply(res.status, res.data);
    }
  }

  nock.disableNetConnect();

  const PRWildcard = `/repos/ethereum/EIPs/pulls/${pullNumber}`;
  return records.find(
    (record) =>
      record.req.method === "GET" &&
      record.req.url === `${baseUrl}${PRWildcard}`
  ).res.data as PR;
};

// TODO: rename and reorganize these debugging tools
export const __MAIN_MOCK__ = async (mockEnv?: NodeJS.ProcessEnv) => {
  const isMock =
    process.env.NODE_ENV === NodeEnvs.mock ||
    process.env.NODE_ENV === NodeEnvs.test;

  if (!isMock) throw new Error("trying to run debug without proper auth");

  // setup debug env
  setMockContext(mockEnv);

  // by instantiating after context and env are custom set,
  // it allows for a custom environment that's setup programmatically
  const main = require("src/main").main;
  return await main();
};

export const setMockContext = (mockEnv?: NodeJS.ProcessEnv) => {
  const env = { ...process.env, ...mockEnv };
  process.env = env;

  if (!env.PULL_NUMBER) throw new Error("PULL_NUMBER is required to mock");
  const pr = mockPR(parseInt(env.PULL_NUMBER || "") || 0);

  // By instantiating after above it allows it to initialize with custom env
  const context = require("@actions/github").context;

  context.payload.pull_request = {
    base: {
      sha: pr.base.sha
    },
    head: {
      sha: pr.head.sha
    },
    number: parseInt(env.PULL_NUMBER || "") || 0
  };

  context.repo.owner = env.REPO_OWNER_NAME;
  context.repo.repo = env.REPO_NAME;

  context.payload.repository = {
    name: env.REPO_NAME,
    owner: {
      key: "",
      login: env.REPO_OWNER_NAME,
      name: env.REPO_OWNER_NAME
    },
    full_name: `${env.REPO_OWNER}/${env.REPO_NAME}`
  };
  context.eventName = env.EVENT_TYPE;
};
