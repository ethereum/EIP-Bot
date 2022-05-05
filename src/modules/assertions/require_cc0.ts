// Issue #70, Originally from #55
// Require CC0 waiver 
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

// BOT will fail if no CC0 detected in PR body
// Just after: Verify correct environment and request context in main.ts, if no CC0 is detected, 
// BOT will fail and comment: "error: No CC0 waiver detected" 

export const  checkCC0 = () => {
        
	const github = getOctokit(GITHUB_TOKEN).rest;
	if !(github.pulls.get(context.payload?.pull_request?.body).search("CC0")) {
		console.log(`Critical error: No CC0 waiver detected`);
		System.exit(1);
	}	

};

// Copyright and related rights waived via [CC0](https://creativecommons.org/publicdomain/zero/1.0/).



