import { context, getOctokit } from "@actions/github";
import {
  GITHUB_TOKEN,
  GithubSelf,
  PR,
  Review
} from "src/domain";
	
export const getCreatedAt = () => { 
  const github = getOctokit(GITHUB_TOKEN).rest;
  console.warn(`Warning: Please ensure to include in the preamble PR_Created_date: ${context.payload?.pull_request?.created_at}`);

}; 

