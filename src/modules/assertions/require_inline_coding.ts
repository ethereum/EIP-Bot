import { context } from "@actions/github";
import _ from "lodash";

export const  requireInlineCoding = () => {
  const solfileRegex = /http:\/\/\S+.sol/g;
  if (!(context.payload?.pull_request?.body)) {return 0;}
  if (solfileRegex.test(JSON.stringify(context.payload?.pull_request?.body))) {
    console.log(`EIP-BOT is terminating. Please replace external link http://.../file.sol for inline code reference..`);
    process.exit(1);
  }
  return 1;
};

