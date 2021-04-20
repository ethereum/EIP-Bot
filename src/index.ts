import { setFailed } from "@actions/core";
import { getOctokit, context } from "@actions/github";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";

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

// HACK (alita): check the CI status and only continue if the CI is successful
const deleteFailedWorkflowRun = async () => {
  const Github = getOctokit(GITHUB_TOKEN);
  const pr = await requirePr();
  const workflowRuns = await Github.actions
    .listWorkflowRuns({
      owner: context.repo.owner,
      repo: context.repo.repo,
      workflow_id: "auto-merge-bot.yml",
      actor: pr.user?.login,
      event: "pull_request_target"
    })
    .then((res) =>
      res.data.workflow_runs.filter((run) => run.head_sha === pr.head.sha)
    ).catch(err => {
      setFailed(err);
      throw err;
    });

  if (!workflowRuns || !workflowRuns[0] || workflowRuns.length === 0) {
    // the failed workflow was already deleted
    console.log("No workflow runs were found!")
    return;
  }

  if (workflowRuns.length !== 1) {
    const message = [
      `expected only 1 workflow run by ${pr.user?.login} of even type`,
      `pull_request_target to exist, but found more than one; aborting...`
    ].join(" ")
    setFailed(message);
    throw message;
  }

  const run = workflowRuns[0];
  if (run.conclusion === "failure") {
    console.log("Found failed workflow run, deleting...")
    await Github.actions.deleteWorkflowRun({
      repo: context.repo.repo,
      owner: context.repo.owner,
      run_id: run.id
    }).then(res => {
      console.log("Success!")
    }).catch(err => {
      setFailed(err);
      throw err;
    })
  }
};

export const pauseInterval = (checker, timeout) => async () => {
  const status = await checker();
  if (!status) {
    setTimeout(pauseInterval(checker, timeout), timeout);
  } else return; // success
};

// only runs the bot if the CI statuses pass; checks every 30 seconds
if (process.env.NODE_ENV === "development") setDebugContext();

console.log(
  [
    "This simple branched action deletes the most recent failed auto-merge-bot",
    "run on the PR in context; it's meant to be triggered by an event of",
    "pull_request_review; it was designed as a work-around because when a review",
    "is left, and the auto-merge-bot re-runs, github creates a new workflow run",
    "(of event-type pull_request_review) and does not remove the previous",
    "run based on event-type pull_request_target; essentially, this leaves",
    "a failed run that is confusing for authors because the tests say something",
    "failed, but actually if the tests were refreshed then nothing would have failed\n\n"
  ].join(" ")
);

deleteFailedWorkflowRun();
