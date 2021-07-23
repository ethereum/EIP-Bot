import { mockPR } from "assets/mockPR";

export const __MAIN__ = async (debugEnv?: NodeJS.ProcessEnv) => {
  const isDebug =
    process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test";

  if (!isDebug) throw new Error("trying to run debug without proper auth");

  // setup debug env
  setDebugContext(debugEnv);

  // by instantiating after context and env are custom set,
  // it allows for a custom environment that's setup programmatically
  const main = require("src/main").main;
  return await main();
};

// TODO: rename and reorganize these debugging tools
export const __MAIN_MOCK__ = async (mockEnv?: NodeJS.ProcessEnv) => {
  const isMock = process.env.NODE_ENV === "MOCK"

  if (!isMock) throw new Error("trying to run debug without proper auth");

  // setup debug env
  setMockContext(mockEnv);

  // by instantiating after context and env are custom set,
  // it allows for a custom environment that's setup programmatically
  const main = require("src/main").main;
  return await main();
};

const setMockContext = (debugEnv?: NodeJS.ProcessEnv) => {
  const env = { ...process.env, ...debugEnv };
  process.env = env;

  if (!env.PULL_NUMBER) throw new Error("PULL_NUMBER is required to mock")
  const pr = mockPR(parseInt(env.PULL_NUMBER || "") || 0)

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

  if (env.NODE_ENV === "test") {
    context.repo = {
      owner: env.REPO_OWNER_NAME,
      repo: env.REPO_NAME
    };
  } else {
    // @ts-ignore
    context.repo.owner = env.REPO_OWNER_NAME;
    // @ts-ignore
    context.repo.repo = env.REPO_NAME;
  }

  context.payload.repository = {
    // @ts-ignore
    name: env.REPO_NAME,
    owner: {
      key: "",
      // @ts-ignore
      login: env.REPO_OWNER_NAME,
      name: env.REPO_OWNER_NAME
    },
    full_name: `${env.REPO_OWNER}/${env.REPO_NAME}`
  };
  context.eventName = env.EVENT_TYPE;
};

const setDebugContext = (debugEnv?: NodeJS.ProcessEnv) => {
  const env = { ...process.env, ...debugEnv };
  process.env = env;

  // By instantiating after above it allows it to initialize with custom env
  const context = require("@actions/github").context;

  context.payload.pull_request = {
    base: {
      sha: env.BASE_SHA
    },
    head: {
      sha: env.HEAD_SHA
    },
    number: parseInt(env.PULL_NUMBER || "") || 0
  };

  if (env.NODE_ENV === "test") {
    context.repo = {
      owner: env.REPO_OWNER_NAME,
      repo: env.REPO_NAME
    };
  } else {
    // @ts-ignore
    context.repo.owner = env.REPO_OWNER_NAME;
    // @ts-ignore
    context.repo.repo = env.REPO_NAME;
  }

  context.payload.repository = {
    // @ts-ignore
    name: env.REPO_NAME,
    owner: {
      key: "",
      // @ts-ignore
      login: env.REPO_OWNER_NAME,
      name: env.REPO_OWNER_NAME
    },
    full_name: `${env.REPO_OWNER}/${env.REPO_NAME}`
  };
  context.eventName = env.EVENT_TYPE;
};
