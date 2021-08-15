require("module-alias/register");
import moment from "moment-timezone";
import { WITHDRAWN_CUTOFF } from "./constants";
import {
  createBranch,
  getCommitDate,
  getEIPContent,
  getEIPs,
  getIsValidStateEIP,
  setDebugContext
} from "./lib";

setDebugContext();

// Action begins ----
const run = async () => {
  // gets the contents of the EIPS directory
  const eips = await getEIPs();

  // checks if the last date the file was changed is greater than a year ago
  const datesChanged = await Promise.all(eips.slice(0, 10).map(getCommitDate));
  const oldEnoughEIPs = datesChanged.filter((date) =>
    moment(date.date).isBefore(WITHDRAWN_CUTOFF)
  );

  // retrieves the details of the old files
  const EIPContents = await Promise.all(oldEnoughEIPs.map(getEIPContent))
  const EIPsToWithdraw = EIPContents.filter(
    async (eip) => await getIsValidStateEIP(eip.parsed)
  );

  // if there are no EIPs to withdraw then stop here
  if (!EIPsToWithdraw.length) return;

  const branch = `Withdrawn-EIP-Bot-${moment().format("(YYYY-MMM-Do@HH.m.s)")}`
  await createBranch(branch).then(res => console.log("successfully created ", branch))

  for (const {content} of EIPsToWithdraw) {

  }


  console.log(EIPsToWithdraw.map((eip) => eip.eip.name));
};

run();
