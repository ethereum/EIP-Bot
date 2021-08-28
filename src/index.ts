require("module-alias/register");
import moment from "moment-timezone";
import {
  FrontMatterAttributes,
  STAGNATION_CUTOFF,
} from "./constants";
import {
  applyStagnantProtocol,
  filterBoolean,
  getCommitDate,
  getEIPContent,
  getEIPs,
  getIsValidStateEIP
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

  function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }

  // if there are no EIPs to withdraw then stop here
  if (!EIPsToWithdraw.length) {
    console.log(
      `No EIPs were found to be last edited before ${STAGNATION_CUTOFF.toISOString()}`
    );
    return;
  }

  // must run synchronously to avoid race conditions and rate limiters
  for (const EIP of EIPsToWithdraw) {
    await applyStagnantProtocol(EIP)
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
