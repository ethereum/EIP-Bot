require("module-alias/register");
import moment from "moment-timezone";
import { DEFAULT_BRANCH, EipStatus, EIP_EDITORS, WITHDRAWN_CUTOFF } from "./constants";
import {
  capitalize,
  createBranch,
  createFileUpdateCommit,
  createPR,
  getCommitDate,
  getEIPContent,
  getEIPs,
  getIsValidStateEIP,
  setDebugContext
} from "./lib";
import async from "async";
import plimit from "p-limit";
import { NodeEnvs } from "./types";

if (
  process.env.NODE_ENV === NodeEnvs.test ||
  process.env.NODE === NodeEnvs.mock
) {
  setDebugContext();
}

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
    moment(date.date).isBefore(WITHDRAWN_CUTOFF)
  );

  console.log(
    `checking for stale EIPs that weren't edited before ${WITHDRAWN_CUTOFF.toISOString()}`
  );
  // retrieves the details of the old files
  const EIPContents = await Promise.all(oldEnoughEIPs.map(getEIPContent));
  const EIPsToWithdraw = await async.filter(
    EIPContents,
    async (eip) => await getIsValidStateEIP(eip.parsed)
  );

  // if there are no EIPs to withdraw then stop here
  if (!EIPsToWithdraw.length) {
    console.log(
      `No EIPs were found to be last edited before ${WITHDRAWN_CUTOFF.toISOString()}`
    );
    return;
  }

  const branchName = `Withdrawn-EIP-Bot-${moment().format(
    "(YYYY-MMM-Do@HH.m.s)"
  )}`;
  await createBranch(branchName);

  // synchronise is necessary for the commits avoid commit race conditions
  for (const { content } of EIPsToWithdraw) {
    const statusRegex = /(?<=status:).*/;
    const withdrawn = ` ${capitalize(EipStatus.withdrawn)}`;
    await createFileUpdateCommit({
      file: content.file,
      branchName,
      content: content.decoded.replace(statusRegex, withdrawn)
    });
  }

  // const branch = await getBranchObject(branchName);
  await createPR({
    fromBranch: branchName,
    toBranch: DEFAULT_BRANCH,
    title: `Withdrawn Bot ${moment().toISOString()}`,
    body: EIP_EDITORS.join(" ")
  });
};

run();
