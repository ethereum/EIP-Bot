import { context, getOctokit } from "@actions/github";
import { setFailed } from "@actions/core";
import {
  GITHUB_TOKEN,
  GithubSelf,
  PR,
  Review
} from "src/domain";
import _ from "lodash";

export const  requireInlineCoding = () => {
  const github = getOctokit(GITHUB_TOKEN).rest;
  const sol_file_Regex = /http:\/\/\S+.sol/g;
  if (sol_file_Regex.test(context.payload?.pull_request?.body) {
    console.log(`EIP-BOT is terminating. Please replace external link http://.../file.sol for inline code reference..`);
    System.exit(1);
  }
}; 
