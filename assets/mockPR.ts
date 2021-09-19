import { getOctokit } from "@actions/github";
import nock from "nock";
import { GITHUB_TOKEN, isMockMethod, MockMethods, MockRecord, NodeEnvs, PR } from "src/utils";
import { assertSavedRecord, SavedRecord, getMockRecords } from "./records";
import * as fs from "fs";

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
export const mockPR = async (pullNumber: SavedRecord) => {
  const mockRecords = await getMockRecords();
  const records = mockRecords[`PR${pullNumber}`];

  if (!records)
    throw new Error(`no mocked records for pull number ${pullNumber}`);

  for (const record of records) {
    const req = record.req;
    const res = record.res;

    if (!req && !res) continue; // allows for setting {} for new mocks

    const wildcard = req.url.replace(baseUrl, "");

    switch (req.method) {
      case "GET":
        scope.get(wildcard).reply(res.status, res.data);
      case "POST":
        scope.post(wildcard).reply(res.status, res.data);
      case "PATCH":
        scope.patch(wildcard).reply(res.status, res.data);
    }
  }

  nock.disableNetConnect();

  const PRWildcard = `/repos/ethereum/EIPs/pulls/${pullNumber}`;
  return records.find(
    (record) =>
      record.req?.method === "GET" &&
      record.req?.url === `${baseUrl}${PRWildcard}`
  )?.res?.data as PR;
};

// TODO: rename and reorganize these debugging tools
export const __MAIN_MOCK__ = async (mockEnv?: NodeJS.ProcessEnv) => {
  const isMock =
    process.env.NODE_ENV === NodeEnvs.mock ||
    process.env.NODE_ENV === NodeEnvs.test;

  if (!isMock) throw new Error("trying to run debug without proper auth");

  // setup debug env
  await setMockContext(mockEnv);

  // by instantiating after context and env are custom set,
  // it allows for a custom environment that's setup programmatically
  const main = (await import("src/main")).main;

  // only want to run this once to make things easier
  try {
    return await main();
  } catch (err: any) {
    const url = err?.request?.url;
    const method = err?.request?.method;

    if (url && method) {
      await fetchAndCreateRecord(url, method);
    } else {
      throw err;
    }
  }
};

export const setMockContext = async (mockEnv?: NodeJS.ProcessEnv) => {
  const env = { ...process.env, ...mockEnv };
  process.env = env;

  if (!env.PULL_NUMBER) throw new Error("PULL_NUMBER is required to mock");

  // setup saved record (mocking network responses)
  assertSavedRecord(env.PULL_NUMBER);
  const pr = await mockPR(env.PULL_NUMBER);

  // By instantiating after above it allows it to initialize with custom env
  const context = require("@actions/github").context;

  context.payload.pull_request = {
    base: {
      sha: pr?.base?.sha
    },
    head: {
      sha: pr?.head?.sha
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

const fetchAndCreateRecord = async (url: string, method: MockMethods) => {
  console.error("failed request", method, url, "\nmocking requet...");

  nock.cleanAll();
  nock.enableNetConnect();
  const github = getOctokit(GITHUB_TOKEN).request;
  const res = await github({
    method,
    url
  }).catch((err) => {
    nock.disableNetConnect();
    throw err;
  });
  console.log("successfully fetched data");
  nock.disableNetConnect();

  const fileName = `records/${process.env.PULL_NUMBER}.json`;
  const mockedRecord: MockRecord[] = (await import("./" + fileName)).default;

  isMockMethod(method)
  mockedRecord.push({
    req: {
      url,
      method
    },
    res: {
      status: res.status,
      data: res.data
    }
  });

  fs.writeFile(
    process.cwd() + "/assets/" + fileName,
    JSON.stringify(mockedRecord, null, 2),
    () => {
      console.log("wrote file");
    }
  );
};
