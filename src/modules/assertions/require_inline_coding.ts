import { context } from "@actions/github";
import _ from "lodash";
export const  requireInlineCoding = () => {
  //test
  const solfileRegex = /http:\/\/\S+.sol/g;
  const prBodyString = (context.payload?.pull_request?.body != null) ? JSON.stringify(context.payload?.pull_request?.body) : null ;
  const prBodyRegexMatches = (prBodyString != null ) ? prBodyString.match(solfileRegex) : null ; 
  
  if (!(prBodyString) || (prBodyString.length === 0)) {return 0;}
  if (prBodyRegexMatches != null) {
     for (let i = 0; i < prBodyRegexMatches.length; i++) {
        console.log(`EIP-BOT is terminating. Please replace external link http://.../file.sol: ${prBodyRegexMatches[i]} for inline code reference..`);
      }
     process.exit(1);
  } 
  return 1;
};
