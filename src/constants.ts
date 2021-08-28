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
