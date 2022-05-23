import { context } from "@actions/github";
import _ from "lodash";

export const  requireInlineCoding = () => {
  const sol_file_Regex = /http:\/\/\S+.sol/g;
  if (sol_file_Regex.test(context.payload?.pull_request?.body)) {
    console.log(`EIP-BOT is terminating. Please replace external link http://.../file.sol for inline code reference..`);
    process.exit(1);
  }
return 1;
};

