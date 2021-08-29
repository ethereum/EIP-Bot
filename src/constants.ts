import moment from "moment-timezone";
import _ from "lodash/fp";

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

export const BOT_ID = "1272989785";

export const EIPPathsToAlwaysExclude = ["EIPS/eip-1.md"];

/**
 *  These labels are helpful to collecting
 *  bot created pull requests but also the
 *  combination of "created-by-bot" and the
 *  bot ID allow for precise tracking of PRs
 *  created by this bot; this is helpful for
 *  later cleanup
 */
export const PR_KEY_LABELS = [`created-by-bot`, BOT_ID];

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
    console.log(`Updating ${path} to status ${EipStatus.stagnant}`),
  fetchingBotCreatedPRSearch: (searchPattern) =>
    console.log(
      `fetching open PRs created by bot ${BOT_ID} search pattern ${searchPattern}`
    ),
  successfulBotCreatedPRSearch: (PRNums: number[]) =>
    console.log(
      `old PRs created by bot ${BOT_ID} were fetched successfully\n`,
      `the following PR numbers were found:\n`,
      _.chunk(
        10,
        PRNums.sort((a, b) => a - b)
      )
        .map((chunk) => chunk.join(", "))
        .join("\n ")
    ),
  successfulBotCreatedPRSearchNoResult: () =>
    console.log(
      `old PRs created by bot ${BOT_ID} were fetched successfully, but none were found`
    ),
  fechingFilePaths: () => console.log("fetching file paths"),
  pathsWithPRs: (paths: string[]) =>
    console.log(
      [
        `bot ${BOT_ID}'s previous pull requests are still open for\n`,
        _.chunk(
          4,
          paths.filter((path) => !EIPPathsToAlwaysExclude.includes(path))
        )
          .map((chunk) => chunk.join(", "))
          .join("\n ")
      ].join(" ")
    )
};

export const Resolve = {
  noEIPs: () =>
    console.log(
      `No EIPs were found to be last edited before ${STAGNATION_CUTOFF.toISOString()}`
    )
};
