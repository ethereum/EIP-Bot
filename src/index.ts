require("module-alias/register");
import moment from "moment-timezone";
import {
  EIPPathsToAlwaysExclude,
  Logs,
  Resolve,
  STAGNATION_CUTOFF
} from "./constants";
import {
  applyStagnantProtocol,
  fetchPreExistingEIPPaths,
  filterBoolean,
  getCommitDate,
  getEIPContent,
  getEIPs,
  getFilePathsWithNonBotOpenPRs,
  getIsValidStateEIP,
  limit
} from "./lib";
import { NodeEnvs } from "./types";
import { setDebugContext } from "./debug";
import _ from "lodash/fp";

const run = async () => {
  // gets the contents of the EIPS directory
  const allEIPs = (await getEIPs());

  // exclude EIPs with PRs already open for them
  const allEIPPaths = allEIPs.map((EIP) => EIP.path);
  const preExistingEIPPaths = await fetchPreExistingEIPPaths();
  const activeFiles = await getFilePathsWithNonBotOpenPRs();
  const EIPsToExclude = _.intersection(preExistingEIPPaths, allEIPPaths).concat(
    EIPPathsToAlwaysExclude,
    activeFiles
  );
  Logs.pathsWithPRs(EIPsToExclude);

  const EIPs = allEIPs.filter((eip) => !EIPsToExclude.includes(eip.path));

  Logs.fetchingDates();
  const datesChanged = await Promise.all(
    EIPs.map((EIP) => limit(() => getCommitDate(EIP)))
  );
  const oldEnoughEIPs = datesChanged.filter((date) =>
    moment(date.date).isBefore(STAGNATION_CUTOFF)
  );

  Logs.checkingStagnant();
  const EIPContents = filterBoolean(
    await Promise.all(oldEnoughEIPs.map(getEIPContent))
  );
  const EIPsToStagnate = EIPContents.filter(Boolean).filter((EIP) =>
    getIsValidStateEIP(EIP.parsed)
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
