require("module-alias/register");
import moment from "moment-timezone";
import { EipStatus, WITHDRAWN_CUTOFF } from "./constants";
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

setDebugContext();

// Action begins ----
const run = async () => {
  // gets the contents of the EIPS directory
  const eips = await getEIPs();

  // checks if the last date the file was changed is greater than a year ago
  const limit = plimit(10); // without a limiter github will flag too many parallel requests in the next step
  const datesChanged = await Promise.all(
    eips.map((eip) => limit(() => getCommitDate(eip)))
  );
  const oldEnoughEIPs = datesChanged.filter((date) =>
    moment(date.date).isBefore(WITHDRAWN_CUTOFF)
  );

  // retrieves the details of the old files
  const EIPContents = await Promise.all(oldEnoughEIPs.map(getEIPContent));
  const EIPsToWithdraw = await async.filter(
    EIPContents,
    async (eip) => await getIsValidStateEIP(eip.parsed)
  );

  // if there are no EIPs to withdraw then stop here
  if (!EIPsToWithdraw.length) return;

  const branchName = `Withdrawn-EIP-Bot-${moment().format(
    "(YYYY-MMM-Do@HH.m.s)"
  )}`;
  await createBranch(branchName);

  // synchronise is necessary for the commits avoid
  // commit race conditions
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
    toBranch: "master",
    title: `Withdrawn Bot ${moment().toISOString()}`,
    body: "@alita-moore"
  });
};

run();
