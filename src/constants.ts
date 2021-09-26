import moment from "moment-timezone";
import _ from "lodash";
import { Comment, Files } from "./types";

export const SYNCHRONOUS_PROMISE_LIMIT = 10;
export const GITHUB_TOKEN = process.env.GITHUB_TOKEN as string;
export const STAGNATION_CUTOFF_MONTHS = 6;
export const STAGNATION_CUTOFF = moment().subtract(
  STAGNATION_CUTOFF_MONTHS,
  "months"
);

// this supports multiple search REs
const STAGNANT_BRANCH_SEARCH_RE = [
  /mark-eip-(\d)+-stagnant-\(\d+-[a-zA-Z]+-.+\@\d+\.\d+\.\d+\)/
];
/**
 * returns the first substring matching one of the
 * branch search regexes
 */
export const extractBranchFromRef = (
  ref: string,
  REs: RegExp[] = STAGNANT_BRANCH_SEARCH_RE
): string | undefined => {
  const RE = REs[0];
  if (!RE) return;
  const result = ref.match(RE);
  if (!result) {
    return extractBranchFromRef(ref, REs.slice(1));
  }
  return result[0];
};

export const formatDate = (date: moment.Moment) => {
  return date.format("(YYYY-MMM-Do@HH.m.s)");
};

export const MERGEABLE_CUTOFF = moment().subtract(2, "weeks");
export const MERGEABLE_CUTOFF_DESCRIPTION = "2 weeks";

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
  successfulBranchDeletion: (branchName) => {
    console.log(
      "successfully deleted branch",
      _.truncate(branchName, { length: 50 })
    );
  },
  wait: (seconds) =>
    console.log(
      `===== waiting ${seconds} seconds before continuing to avoid rate limiting =====\n`
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
      `\tThere were ${PRNums.length} PRs found\n`,
      _.chunk(
        PRNums.sort((a, b) => a - b),
        10
      )
        .map((chunk) => chunk.join(", "))
        .join("\n ")
    ),
  successfulBotCreatedPRSearch: (PRNums: number[]) =>
    console.log(
      `old PRs created by bot ${BOT_ID} were fetched successfully\n`,
      `There were ${PRNums.length} PRs found\n`,
      _.chunk(
        PRNums.sort((a, b) => a - b),
        10
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
  fetchedActiveFiles: (paths: string[]) => {
    console.log(
      [
        `Non bot ${BOT_ID} pull requests are touching these files:\n`,
        `\t(there's a total of ${paths.length} active files)\n`,
        _.chunk(
          paths.filter((path) => !EIPPathsToAlwaysExclude.includes(path)),
          4
        )
          .map((chunk) => chunk.join(", "))
          .join("\n ")
      ].join(" ")
    );
  },
  pathsWithPRs: (paths: string[]) =>
    console.log(
      [
        `bot ${BOT_ID}'s previous pull requests are still open for\n`,
        `\t(there's a total of ${paths.length} open pull requests)\n`,
        _.chunk(
          paths.filter((path) => !EIPPathsToAlwaysExclude.includes(path)),
          4
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
        _.chunk(paths, 4)
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
        _.chunk(prNums, 10)
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
          files.map((file) => file.filename),
          2
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
      `successfully marked PR ${prNum} with title "${_.truncate(title, {
        length: 40
      })}" as ready for review`
    );
  },
  mergingOldPR: (path: string, prNum: number, createdAt: moment.Moment) => {
    const message = [
      `PR ${prNum} with changes to ${path} was created on \n\t${formatDate(
        createdAt
      )}`,
      `which is before the cutoff date of \n\t${formatDate(MERGEABLE_CUTOFF)}`,
      `i.e. ${MERGEABLE_CUTOFF_DESCRIPTION} ago`
    ].join("\n");
    console.log(message);
    return message;
  },
  mergedSuccessful: () => {
    console.log(`succesfully merged`);
  },
  closingDueToNonSelf: (PRNum: number, author: string = "", self: string) => {
    console.log(
      [
        `===== closing PR ${PRNum} because its author's login is ${author} but the`,
        `user running this script is ${self}; it's assumed that a bot is running this so`,
        `a change in user is assumed to be in error or due to testing.`
      ].join(" ")
    );
  },
  abortClosingDueToCommentsOnPR: (comments: Comment[], PRNum: number) => {
    const formatComment = (comment: Comment, index: number) => {
      if (comment.body) {
        return [
          `\t${index}) "${_.truncate(comment.body, { length: 40 })}"`,
          `from ${comment.user?.login}`
        ].join(" ");
      }
      return `\t${index}) no comment body`;
    };
    console.log(
      [
        `PR ${PRNum} will not be closed because at least one comment was left on it`,
        `\t${comments.length} comment(s) were found`,
        ...comments.map(formatComment)
      ].join("\n")
    );
  },
  noObsoletePRFound: () => {
    console.log(
      [
        `\nno pre-existing and created by bot ${BOT_ID} pull requests`,
        `were found to have an active and open pull request associated`,
        `with the relevant EIP file`
      ].join(" ")
    );
  },
  closingDueToObsolete: (PRNum: number) => {
    console.log(
      [
        `-- closing PR ${PRNum} because it is no longer eligible for stagnation`
      ].join(" ")
    );
  },
  failedToMerge: (err: any) => {
    console.log("failed to merge\n\n", err);
  },
  cleanupComplete: () => {
    console.log("\n\t====== CLEANUP COMPLETE =====\n");
  },
  foundRefs: (refs: string[]) => {
    console.log(`successfully found ${refs.length} references`);
  },
  foundBranches: (branches: string[]) => {
    console.log(`extracted ${branches.length} bot created branches`);
  },
  foundOrphanedBranches: (branches: string[]) => {
    console.log(
      [
        `The following bot created branches were not associated with an active PR\n`,
        `\t(${branches.length} orphaned branches were found)\n`,
        ...branches.map(
          (branch, i) => `\t${i}) ${_.truncate(branch, { length: 50 })}\n`
        )
      ].join(" ")
    );
  },
  noOrphanedBranchesFound: () => {
    console.log("no orphaned branches were found");
  }
};

export const Resolve = {
  noEIPs: () =>
    console.log(
      `No EIPs were found to be last edited before ${STAGNATION_CUTOFF.toISOString()}`
    )
};
