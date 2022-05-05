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
// BOT will fail and comment: "error: No CC0 waiver detected" 

export const  checkCC0 = () => {
        
	const github = getOctokit(GITHUB_TOKEN).rest;
	if !(((context.payload?.pull_request?.body).endsWith("Copyright and related rights waived via [CC0](https://creativecommons.org/publicdomain/zero/1.0/).")) || ((context.payload?.pull_request?.body).endsWith("Copyright and related rights waived via [CC0](https://creativecommons.org/publicdomain/zero/1.0/).\n"))) {
		console.log(`Critical error: CC0 Copyright must be the last thing in the EIP.`);
		System.exit(1);
	}	

};
