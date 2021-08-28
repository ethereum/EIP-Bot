import moment from "moment-timezone";

export const GITHUB_TOKEN = process.env.GITHUB_TOKEN as string;
export const STAGNATION_CUTOFF_MONTHS = 6;
export const STAGNATION_CUTOFF = moment().subtract(
  STAGNATION_CUTOFF_MONTHS,
  "months"
);

export const USERNAME_DELIMETER = ", ";

/** for cleaning strings so they can be safely compared */
export const cleanString = (str: string) => {
  return str.toLowerCase().replace(/\s/, "");
};

/**
 *  This key is attached to all PRs created, it's later used to
 *  easily retrieve the created / non-closed PRs created during
 *  a prior run so that it can clean them up; the pull request
 *  must have all of these labels for it to be captured
 */
export const PR_KEY_LABELS = [
  "catapult",
  "violate",
  "amerce",
  "download",
  "academia",
  "cathedra",
  "tallow",
  "uglify"
];

export enum FrontMatterAttributes {
  status = "status",
  eip = "eip",
  author = "author"
}

/** pull requests will open against this */
export const DEFAULT_BRANCH = "master";

export const EIP_EDITORS = [
  "@MicahZoltu",
  "@lightclient",
  "@arachnid",
  "@cdetrio",
  "@Souptacular",
  "@vbuterin",
  "@nicksavers",
  "@wanderer",
  "@gcolvin",
  "@axic"
];

export enum EipStatus {
  draft = "draft",
  withdrawn = "withdrawn",
  lastCall = "last call",
  review = "review",
  final = "final",
  idea = "idea",
  living = "living",
  stagnant = "stagnant"
}

/** @deprecated */
export const WITHDRAWABLE_STATUSES: EipStatus[] = [
  EipStatus.draft,
  EipStatus.review,
  EipStatus.stagnant,
  EipStatus.lastCall
];

export const STAGNATABLE_STATUSES: EipStatus[] = [
  EipStatus.draft,
  EipStatus.review
];

export const Logs = {
  fetchingDates: () => console.log("fetching file modified dates..."),
  checkingStagnant: () =>
    console.log(
      `checking for stagnant EIPs that weren't edited before ${STAGNATION_CUTOFF.toISOString()}`
    ),
  successfulPR: (title) =>
    console.log(`successfully created pull request titled ${title}`),
  successfulKeyLabels: () =>
    console.log("successfully added key labels to the pull request"),
  protocolStart: (EIPNum) => console.log(`\n================ EIP ${EIPNum}`),
  successfulBranch: (branchName) =>
    console.log("successfully created branch", branchName),
  wait: (seconds) =>
    console.log(
      `===== waiting ${seconds} seconds before continuing to avoid rate limiting =====`
    ),
  succesfulFileUpdate: (path) =>
    console.log(`Updating ${path} to status ${EipStatus.stagnant}`)
};

export const Resolve = {
  noEIPs: () =>
    console.log(
      `No EIPs were found to be last edited before ${STAGNATION_CUTOFF.toISOString()}`
    )
};
