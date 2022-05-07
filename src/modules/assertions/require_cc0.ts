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
  // const copyrightRegex = /^[\s\S]*## Copyright\n*Copyright and related rights waived via \[CC0\]\(.+\)\.\n*$/g;
  // if (context.payload?.pull_request?.body && copyrightRegex.test(context.payload?.pull_request?.body)) {
  //  console.log(`Critical error: CC0 Copyright must be the last thing in the EIP.`);
    
  const expected = `\n## Copyright\nCopyright and related rights waived via [CC0](../LICENSE.md).`
  const body = context.payload?.pull_request?.body
  
  // TODO: we should figure out what conditions allow us to reach this code with `body` being null.
  //could BOT force PUSH license into empty body (not empty anymore, is it allowed ?) ? Question..
  
  if (body === null) return;
  if (body.endsWith(expected) || body.endsWith(`${expected}\n`) return;
  console.log(`Critical error: CC0 Copyright must be the last thing in the EIP.  The file should end with:\n## Copyright\nCopyright and related rights waived via [CC0](../LICENSE.md).`);
  System.exit(1);  
    
    System.exit(1);
  }

};
