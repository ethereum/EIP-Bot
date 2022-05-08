import { context, getOctokit } from "@actions/github";
import { setFailed } from "@actions/core";
import {
  GITHUB_TOKEN,
  GithubSelf,
  PR,
  Review
} from "src/domain";
import _ from "lodash";

// BOT will fail if no CC0 detected in PR body
// Just after: Verify correct environment and request context in main.ts, if no CC0 is detected, 
// BOT will fail and comment: "error: No CC0 waiver detected".

export const  checkCC0 = () => {
        
	const github = getOctokit(GITHUB_TOKEN).rest;
  const copyrightRegex = /^[\s\S]*\n## Copyright\nCopyright and related rights waived via \[CC0\]\(\.\.\/LICENSE.md\)\.\n?$/g
  
  // TODO: we should figure out what conditions allow us to reach this code with `body` being null.
  // If body is null there is no license, EIP-BOT must exit(1). let me know if you agree with it..
  
  if (body === null) return;
  if (context.payload?.pull_request?.body && !(copyrightRegex.test(context.payload?.pull_request?.body))) {
    console.log(`Critical error: CC0 Copyright must be the last thing in the EIP.  The file should end with:\n## Copyright\nCopyright and related rights waived via [CC0](../LICENSE.md).`);
    System.exit(1);  
     
  }

};
