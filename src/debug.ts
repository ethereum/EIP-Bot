// @ts-nocheck
import { NodeEnvs } from "./types";

export const setDebugContext = async (debugEnv?: NodeJS.ProcessEnv) => {
  const env = { ...process.env, ...debugEnv };
  process.env = env;

  // By instantiating after above it allows it to initialize with custom env
  const context = (await import("@actions/github")).context;

  context.payload.pull_request = {
    base: {
      sha: env.BASE_SHA
    },
    head: {
      sha: env.HEAD_SHA
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
  context.sha = env.SHA;
};
