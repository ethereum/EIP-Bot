import { context } from "@actions/github";
import _ from "lodash";

export const  requireInlineCoding = () => {
  const solfileRegex = /http:\/\/\S+.sol/g;
  const prBodyString = JSON.stringify(context.payload?.pull_request?.body);
  if (!(prBodyString) || (prBodyString.length === 0)) {return 0;}
  if (solfileRegex.test(prBodyString)) {
    console.log(`EIP-BOT is terminating. Please replace external link http://.../file.sol: ${prBodyString.match(solfileRegex)} for inline code reference..`);
    process.exit(1);
  }
  return 1;
};
