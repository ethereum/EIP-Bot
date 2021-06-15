import { setFailed } from "@actions/core";
import { getOctokit, context } from "@actions/github";

const CHECK_STATUS_INTERVAL = 30000
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";

const setDebugContext = (debugEnv?: NodeJS.ProcessEnv) => {
  const env = {...process.env, ...debugEnv};
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
    }
  } else {
    // @ts-ignore
    context.repo.owner = env.REPO_OWNER_NAME;
    // @ts-ignore
    context.repo.repo = env.REPO_NAME
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
}

const requirePr = async () => {
  const Github = getOctokit(GITHUB_TOKEN);

  const prNum = requirePullNumber();
  const { data: pr } = await Github.pulls.get({
    repo: context.repo.repo,
    owner: context.repo.owner,
    pull_number: prNum
  });

  if (pr.merged) {
    throw `PR ${prNum} is already merged; quitting`;
  }

  return pr;
};

const requirePullNumber = () => {
  const payload = context.payload;

  if (!payload.pull_request?.number) {
    throw "Build does not have a PR number associated with it; quitting...";
  }

  return payload.pull_request.number;
};

let lastStatus: "failure" | "success" | undefined;
// HACK (alita): check the CI status and only continue if the CI is successful
const checkCIStatus = async () => {
  const Github = getOctokit(GITHUB_TOKEN);
  const pr = await requirePr()
  const data = await Github.repos.getCombinedStatusForRef({
    owner: context.repo.owner,
    repo: context.repo.repo,
    ref: pr.head.sha
  }).then(res => res.data)

  const status = data.state;

  console.log(`status of CI is '${status}'...`)
  if (status === "failure") {
    if (lastStatus === "failure") {
      setFailed("CI checks failed; bot can only merge if CI checks pass")
      throw "CI checks failed; bot can only merge if CI checks pass"
    }
    console.log(
      [
        "CI status was found to be a failure, but it will",
        "re-check because the status isn't always accurate 😬"
      ].join(" ")
    );
    const {repository, ...debugInfo} = data;
    console.log(debugInfo);
    lastStatus = "failure";
    return false; // re-runs bot
  }

  if (status === "success") {
    if (lastStatus === "success") {
      return true;
    }
    console.log(
      [
        "CI status was found to be a success, but it will",
        "re-check because the status isn't always accurate 😬"
      ].join(" ")
    );
    const {repository, ...debugInfo} = data;
    console.log(debugInfo);
    lastStatus = "success";
    return false;
  }

  // if neither success or failure clear lastStatus and continue looping
  lastStatus = undefined;
  return false;
}

const MAX_LOOPS = 40;
export const pauseInterval = (checker, timeout, loop = 0) => async () => {
  if (loop > MAX_LOOPS) {
    const message = `CI Check timed out after ${MAX_LOOPS * timeout / 1000 / 60} minutes`
    setFailed(message)
    throw message;
  }
  const status = await checker();
  if (!status) {
    setTimeout(pauseInterval(checker, timeout, loop + 1), timeout);
  } else return; // success
}

// only runs the bot if the CI statuses pass; checks every 30 seconds
if (process.env.NODE_ENV === "development") setDebugContext();

console.log([
  "This simple branched action awaits for the",
  "CI to complete before either failing or succeeding.",
  `It checks the status every ${CHECK_STATUS_INTERVAL/1000} seconds.`
].join(" "))
const awaitCI = async () => {
  try {
    await pauseInterval(checkCIStatus, CHECK_STATUS_INTERVAL)()
  } catch (err) {
    setFailed(err);
    console.log(err);
    throw err
  }
}

awaitCI();
