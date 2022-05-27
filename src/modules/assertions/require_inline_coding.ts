import { context } from "@actions/github";
import _ from "lodash";

export const  requireInlineCoding = () => {
  const prBodyRegexMatches? : string[];
  const solfileRegex = /http:\/\/\S+.sol/g;
  const prBodyString = JSON.stringify(context.payload?.pull_request?.body);

  if (!(prBodyString) || (prBodyString.length === 0)) {return 0;}
  prBodyRegexMatches = prBodyString.match(solfileRegex);
  if ((prBodyRegexMatches) || (prBodyRegexMatches.length > 0)) {
    for (let i = 0; i < prBodyRegexMatches.length; i++) {
      console.log(`EIP-BOT is terminating. Please replace external link http://.../file.sol: ${prBodyRegexMatches[i]} for inline code reference..`);
    }
    process.exit(1);
  }
};
