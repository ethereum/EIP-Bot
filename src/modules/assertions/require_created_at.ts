import { context, getOctokit } from "@actions/github";
import {
  GITHUB_TOKEN,
  GithubSelf,
  PR,
  Review
} from "src/domain";
	
export const getCreatedAt = () => { 
  const github = getOctokit(GITHUB_TOKEN).rest;
  const createRegex = /^[\s\S]*created:  \d\d\d\d-\d\d-\d\d\n?/g;
  if !(createRegex.test(context.payload?.pull_request?.body)) {
    console.warn(`Warning: Please ensure to include in the preamble created date: ${context.payload?.pull_request?.created_at}`);
  }
}; 

