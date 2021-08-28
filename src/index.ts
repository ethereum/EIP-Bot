require("module-alias/register");
import moment from "moment-timezone";
import { Logs, Resolve, STAGNATION_CUTOFF } from "./constants";
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

  Logs.fetchingDates();
  const limit = plimit(10); // without a limiter github will flag too many parallel requests in the next step
  const datesChanged = await Promise.all(
    eips.map((eip) => limit(() => getCommitDate(eip)))
  );
  const oldEnoughEIPs = datesChanged.filter((date) =>
    moment(date.date).isBefore(STAGNATION_CUTOFF)
  );

  Logs.checkingStagnant();
  const EIPContents = filterBoolean(
    await Promise.all(oldEnoughEIPs.map(getEIPContent))
  );
  const EIPsToStagnate = EIPContents.filter(Boolean).filter((eip) =>
    getIsValidStateEIP(eip.parsed)
  );

  if (!EIPsToStagnate.length) {
    return Resolve.noEIPs();
  }

  // must run synchronously to avoid race conditions and rate limiters
  for (const EIP of EIPsToStagnate) {
    await applyStagnantProtocol(EIP);
  }
};

if (
  process.env.NODE_ENV === NodeEnvs.test ||
  process.env.NODE === NodeEnvs.mock
) {
  setDebugContext().then(run);
} else {
  run();
}
