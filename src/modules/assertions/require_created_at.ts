// Issue #65, Originally from #55
// Immediately before merging (IMO, ideally in the merge commit itself) set the created date in the preamble.
// Creator: SamWilsn

// to be included when merged in /src/modules/assertions 

import { context, getOctokit } from "@actions/github";
import {
  GITHUB_TOKEN,
  GithubSelf,
  PR,
  Review
} from "src/domain";
import _ from "lodash"; 
	
export const getCreatedAt = () => { 
	const github = getOctokit(GITHUB_TOKEN).rest;
	 console.log(`Warning: Please ensure to include in template PR_Created_date: `+context.payload?.pull_request?.created_at);

}; 

// Copyright and related rights waived via [CC0](https://creativecommons.org/publicdomain/zero/1.0/).
