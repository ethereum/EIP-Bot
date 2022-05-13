import { context, getOctokit } from "@actions/github";
import { setFailed } from "@actions/core";
import {
  GITHUB_TOKEN,
  GithubSelf,
  PR,
  Review
} from "src/domain";
import _ from "lodash";

export const  requireCC0 = () => {
        
	const github = getOctokit(GITHUB_TOKEN).rest;
  const copyrightRegex = /^[\s\S]*\n## Copyright\nCopyright and related rights waived via \[CC0\]\(\.\.\/LICENSE.md\)\.\n?$/g
  if !(context.payload?.pull_request?.body) return;
  if (context.payload?.pull_request?.body && !(copyrightRegex.test(context.payload?.pull_request?.body))) {
    console.log(`Critical error: CC0 Copyright must be the last thing in the EIP.  The file should end with:\n## Copyright\nCopyright and related rights waived via [CC0](../LICENSE.md).`);
    System.exit(1);  
  }
};
