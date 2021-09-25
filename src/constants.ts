import moment from "moment-timezone";
import _ from "lodash/fp";
import { Files } from "./types";

export const SYNCHRONOUS_PROMISE_LIMIT = 10;
export const GITHUB_TOKEN = process.env.GITHUB_TOKEN as string;
export const STAGNATION_CUTOFF_MONTHS = 6;
export const STAGNATION_CUTOFF = moment().subtract(
  STAGNATION_CUTOFF_MONTHS,
  "months"
);

export const formatDate = (date: moment.Moment) => {
  return date.format("(YYYY-MMM-Do@HH.m.s)");
};

export const MERGEABLE_CUTOFF = moment().subtract(2, "weeks");

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
    console.log(`successfully created draft pull request titled ${title}`),
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
  fetchingBotCreatedPRSearch: (searchPattern, page) =>
    console.log(
      `fetching open PRs created by bot ${BOT_ID} search pattern ${searchPattern} (page ${page})`
    ),
  fetchingNonBotCreatedPRs: (searchPattern, page) =>
    console.log(
      `fetching open PRs NOT created by bot ${BOT_ID} search pattern ${searchPattern} (page ${page})`
    ),
  successfulNonBotCreatedPRSearch: (PRNums: number[]) =>
    console.log(
      `old PRs NOT created by bot ${BOT_ID} were fetched successfully\n`,
      `the following PR numbers were found:\n`,
      _.chunk(
        10,
        PRNums.sort((a, b) => a - b)
      )
        .map((chunk) => chunk.join(", "))
        .join("\n ")
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
  successfulNonBotCreatedPRSearchNoResult: () =>
    console.log(
      `old PRs NOT created by bot ${BOT_ID} were fetched successfully, but none were found`
    ),
  fechingFilePaths: () => console.log("fetching file paths"),
  pathsWithPRs: (paths: string[]) =>
    console.log(
      [
        `bot ${BOT_ID}'s previous pull requests are still open for\n`,
        `\t(there's a total of ${paths.length} open pull requests)\n`,
        _.chunk(
          4,
          paths.filter((path) => !EIPPathsToAlwaysExclude.includes(path))
        )
          .map((chunk) => chunk.join(", "))
          .join("\n ")
      ].join(" ")
    ),
  warnForRepeatPaths: (paths: string[]) => {
    console.warn(
      [
        `bot ${BOT_ID} has multiple PRs open for\n`,
        `\t(there's a total of ${paths.length} repeat paths)\n`,
        _.chunk(4, paths)
          .map((chunk) => chunk.join(", "))
          .join("\n ")
      ].join(" ")
    );
  },
  closingRepeatPRs: (prNums: number[]) => {
    console.log(
      [
        `closing the following PRs opened by bot ${BOT_ID} because they are repeats\n`,
        `\t(there's a total of ${prNums.length} PRs to close)\n`,
        _.chunk(10, prNums)
          .map((chunk) => chunk.join(", "))
          .join("\n ")
      ].join(" ")
    );
  },
  successfullyClosedPR: (prNum: number, title: string) => {
    console.log(`successfully closed PR ${prNum} with title ${title}`);
  },
  successfullyOpenedPR: (prNum: number, title: string) => {
    console.log(`successfully opened PR ${prNum} with title ${title}`);
  },
  warnMultipleFiles: (files: Files, prNum: number) => {
    console.warn(
      [
        `PR ${prNum} created by bot ${BOT_ID} has multiple files\n`,
        `\t(there's a total of ${files.length} files)\n`,
        _.chunk(
          2,
          files.map((file) => file.filename)
        )
          .map((chunk) => chunk.join(", "))
          .join("\n ")
      ].join(" ")
    );
  },
  closingPRDueToMultipleFiles: (prNum: number) => {
    console.log(`closing pr ${prNum} due to it having multiple files`);
  },
  successfulMarkReadyForReview: (prNum: number, title: string) => {
    console.log(
      `successfully marked PR ${prNum} with title "${title}"" as ready for review`
    );
  },
  mergingOldPR: (path: string, prNum: number, createdAt: moment.Moment) => {
    const message = [
      `PR ${prNum} with changes to ${path} was created at ${formatDate(
        createdAt
      )}`,
      `which is before the cutoff date of ${formatDate(
        MERGEABLE_CUTOFF
      )}; therefore`,
      `it will be merged`
    ].join(" ");
    console.log(message);
    return message;
  },
  mergedSuccessful: () => {
    console.log(`succesfully merged`);
  }
};

export const Resolve = {
  noEIPs: () =>
    console.log(
      `No EIPs were found to be last edited before ${STAGNATION_CUTOFF.toISOString()}`
    )
};
