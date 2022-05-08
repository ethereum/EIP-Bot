// Issue #74, Originally from #55
// Require inline coding for http://\S+.sol file reference
// Creator: SamWilsn

// to be included when merged in /src/modules/assertions

import { context, getOctokit } from "@actions/github";
import { setFailed } from "@actions/core";
import {
  GITHUB_TOKEN,
  GithubSelf,
  PR,
  Review
} from "src/domain";
import _ from "lodash";

// BOT will fail and comment: Please replace external link http://.../file.sol for inline code reference.. 

export const  require_file_sol_reference = () => {
  const github = getOctokit(GITHUB_TOKEN).rest;
  const sol_file_Regex = /http:\/\/\S+.sol/g;
  if (sol_file_Regex.test(context.payload?.pull_request?.body) {
    console.log(`EIP-BOT is terminating. Please replace external link http://.../file.sol for inline code reference..`);
    System.exit(1);
  }
}; 



