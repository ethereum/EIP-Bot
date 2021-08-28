require("module-alias/register");
import moment from "moment-timezone";
import {
  DEFAULT_BRANCH,
  EipStatus,
  // EIP_EDITORS,
  FrontMatterAttributes,
  STAGNATION_CUTOFF,
  STAGNATION_CUTOFF_MONTHS
  // USERNAME_DELIMETER
} from "./constants";
import {
  capitalize,
  createBranch,
  createFileUpdateCommit,
  createPR,
  filterBoolean,
  formatDate,
  getAuthorsFromFile,
  getCommitDate,
  getEIPContent,
  getEIPs,
  getIsValidStateEIP,
  wait
} from "./lib";
import plimit from "p-limit";
import { NodeEnvs } from "./types";
import { setDebugContext } from "./debug";

const run = async () => {
  // gets the contents of the EIPS directory
  const eips = await getEIPs();

  console.log("fetching file modified dates...");
  // checks if the last date the file was changed is greater than a year ago
  const limit = plimit(10); // without a limiter github will flag too many parallel requests in the next step
  const datesChanged = await Promise.all(
    eips.map((eip) => limit(() => getCommitDate(eip)))
  );
  const oldEnoughEIPs = datesChanged.filter((date) =>
    moment(date.date).isBefore(STAGNATION_CUTOFF)
  );

  console.log(
    `checking for stale EIPs that weren't edited before ${STAGNATION_CUTOFF.toISOString()}`
  );
  // retrieves the details of the old files
  const EIPContents = filterBoolean(
    await Promise.all(oldEnoughEIPs.map(getEIPContent))
  );
  const EIPsToWithdraw = EIPContents.filter(Boolean).filter((eip) =>
    getIsValidStateEIP(eip.parsed)
  );

  // if there are no EIPs to withdraw then stop here
  if (!EIPsToWithdraw.length) {
    console.log(
      `No EIPs were found to be last edited before ${STAGNATION_CUTOFF.toISOString()}`
    );
    return;
  }



  // synchronise is necessary for the commits avoid commit race conditions
  for (const { content, parsed, date } of EIPsToWithdraw) {
    const EIPNum = parsed.attributes[FrontMatterAttributes.eip];
    const statusRegex = /(?<=status:).*/;
    const stagnant = ` ${capitalize(EipStatus.stagnant)}`;

    console.log(`\n================ EIP ${EIPNum}`)

    const now = formatDate(moment());
    const branchName = `mark-eip-${EIPNum}-stagnant-${now}`;

    await createBranch(branchName);
    await new Promise(r => setTimeout(r, 1000))
    await createFileUpdateCommit({
      file: content.file,
      branchName,
      content: content.decoded.replace(statusRegex, stagnant)
    });

    const authors = await getAuthorsFromFile(parsed).then(
      (res) => res && [...res]
    );

    await new Promise(r => setTimeout(r, 1000))
    console.log(authors);
    await createPR({
      fromBranch: branchName,
      toBranch: DEFAULT_BRANCH,
      title: `EIP ${EIPNum} ${EipStatus.stagnant} ${now}`,
      body: [
        `This EIP has not been active since ${formatDate(moment(date))};`,
        `which, is greater than the allowed time of ${STAGNATION_CUTOFF_MONTHS} months.\n\n`,
        `authors: \n`, // ${authors?.join(USERNAME_DELIMETER)}
        `EIP Editors: ` //`${EIP_EDITORS.join(USERNAME_DELIMETER)}`
      ].join(" ")
    });

    await wait(5);
    await new Promise(r => setTimeout(r, 5000))
  }
};

if (
  process.env.NODE_ENV === NodeEnvs.test ||
  process.env.NODE === NodeEnvs.mock
) {
  setDebugContext().then(() => run());
} else {
  run();
}
