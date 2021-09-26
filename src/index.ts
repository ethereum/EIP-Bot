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
  closeNonSelfBotPRs,
  closeObsoletePRs,
  closeRepeatPRs,
  deleteOrphanedBranches,
  fetchPreExistingEIPPaths,
  filterBoolean,
  getCommitDate,
  getEIPContent,
  getEIPs,
  getFilePathsWithNonBotOpenPRs,
  getIsValidStateEIP,
  limit,
  mergeOldPRs
} from "./lib";
import { NodeEnvs } from "./types";
import { setDebugContext } from "./debug";
import _ from "lodash";

const botCleanup = async () => {
  await closeNonSelfBotPRs();

  const preExistingPaths = await fetchPreExistingEIPPaths();
  // keep in mind that this has to run before checking the
  // file dates because it will create PRs unnecessariliy
  await closeRepeatPRs(preExistingPaths);
  await mergeOldPRs(preExistingPaths);
  await deleteOrphanedBranches(preExistingPaths);
  Logs.cleanupComplete();
};

const run = async () => {
  await botCleanup();

  // gets the contents of the EIPS directory
  const allEIPs = await getEIPs();

  // exclude EIPs with PRs already open for them
  const allEIPPaths = allEIPs.map((EIP) => EIP.path);
  const preExistingPaths = await fetchPreExistingEIPPaths();
  const activeFiles = await getFilePathsWithNonBotOpenPRs();
  const pathsToExclude = _.intersection(
    preExistingPaths.map((eip) => eip.path),
    allEIPPaths
  ).concat(
    EIPPathsToAlwaysExclude,
    activeFiles.map((file) => file.path)
  );
  Logs.pathsWithPRs(pathsToExclude);
  Logs.fetchingDates();

  const datesChanged = await Promise.all(
    allEIPs.map((EIP) => limit(() => getCommitDate(EIP)))
  );
  const oldEnoughEIPs = datesChanged.filter((date) => {
    if (!date.date) return false;
    return moment(date.date).isBefore(STAGNATION_CUTOFF);
  });

  Logs.checkingStagnant();
  const EIPContents = filterBoolean(
    await Promise.all(oldEnoughEIPs.map(getEIPContent))
  );
  const allEIPsToStagnate = EIPContents.filter(Boolean).filter((EIP) =>
    getIsValidStateEIP(EIP.parsed)
  );

  const obsoletePRs = _.differenceBy(
    preExistingPaths,
    allEIPsToStagnate.map((eip) => ({
      path: eip.content.file.path
    })),
    "path"
  );
  await closeObsoletePRs(obsoletePRs);

  const EIPsToStagnate = _.differenceWith(
    allEIPsToStagnate,
    pathsToExclude.concat(obsoletePRs.map((PR) => PR.path)),
    (a, b) => a.content.file.path === b
  );

  if (!EIPsToStagnate.length) {
    return Resolve.noEIPs();
  }
  // must run synchronously to avoid race conditions and rate limiters
  for (const EIP of EIPsToStagnate) {
    // @ts-expect-error typescript isn't parsing EIP properly
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
