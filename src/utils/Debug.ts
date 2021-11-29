import { NodeEnvs } from "../domain/Types";
import { CriticalError } from "src/domain/exceptions";

export const __MAIN__ = async (debugEnv?: NodeJS.ProcessEnv) => {
  const isDebug =
    process.env.NODE_ENV === NodeEnvs.developemnt ||
    process.env.NODE_ENV === NodeEnvs.test;

  if (!isDebug)
    throw new CriticalError("trying to run debug without proper auth");

  // setup debug env
  setDebugContext(debugEnv);

  // by instantiating after context and env are custom set,
  // it allows for a custom environment that's setup programmatically
  const main = require("src/main").main;
  return await main();
};

export const setDebugContext = (debugEnv?: NodeJS.ProcessEnv) => {
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
