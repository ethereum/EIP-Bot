import { context, getOctokit } from "@actions/github";
import {
  ALLOWED_STATUSES,
  CompareCommits,
  EIP_NUM_RE,
  EVENTS,
  File,
  FileDiff,
  Files,
  FileStatus,
  FILE_RE,
  GITHUB_TOKEN
} from "src/utils";
import { getApprovals, getJustLogin } from "./CheckApprovals";

export const requireEvent = () => {
  const event = context.eventName;

  if (!(event === EVENTS.pullRequest || event === EVENTS.pullRequestTarget)) {
    throw `Only events of type ${EVENTS.pullRequest} are allowed`;
  }

  return event;
};

export const requirePullNumber = () => {
  const payload = context.payload;

  if (!payload.pull_request?.number) {
    throw "Build does not have a PR number associated with it; quitting...";
  }

  return payload.pull_request.number;
};

export const requirePr = async () => {
  const Github = getOctokit(GITHUB_TOKEN);

  const prNum = requirePullNumber();
  const { data: pr } = await Github.pulls.get({
    repo: context.repo.repo,
    owner: context.repo.owner,
    pull_number: prNum
  });

  if (pr.merged) {
    throw `PR ${prNum} is already merged; quitting`;
  }

  // if (pr.mergeable_state != "clean") {
  //   throw `PR ${prNum} mergeable state is ${pr.mergeable_state}; quitting`;
  // }

  return pr;
};

/**
 * assert that authors exist for the EIP at the PRs base commit
 *
 * @param file file diff of a given file
 * @returns list of raw author data
 */
export const assertHasAuthors = (file: FileDiff) => {
  // take from base to avoid people adding themselves and being able to approve
  const authors = file.base.authors && [...file.base.authors];

  // Make sure there are authors
  if (!authors || authors.length === 0) {
    return [
      `${file.head.name} has no identifiable authors who`,
      `can approve the PR (only considering the base version)`
    ].join(" ");
  } else return;
};

export const assertIsApprovedByAuthors = async (fileDiff: FileDiff) => {
  const approvals = await getApprovals();
  const authors = requireAuthors(fileDiff);

  // there exists an approver who is also an author
  const hasAuthorApproval = !!approvals.find((approver) =>
    authors.includes(approver)
  );

  if (!hasAuthorApproval) {
    return [
      `${fileDiff.head.name} requires approval from one of`,
      `(${authors.map(getJustLogin).join(", ")})`
    ].join(" ");
  } else return;
};

/**
 * requires that authors exist and returns them else throw error
 *
 * @param file file diff of a given file
 * @returns list of raw author data
 */
export const requireAuthors = (file: FileDiff): string[] => {
  // take from base to avoid people adding themselves and being able to approve
  const authors = file.base.authors && [...file.base.authors];

  // Make sure there are authors
  if (!authors || authors.length === 0) {
    throw `${file.head.name} has no identifiable authors who can approve the PR (only considering the base version)`;
  }

  return authors;
};

const encodings = [
  "ascii",
  "utf8",
  "utf-8",
  "utf16le",
  "ucs2",
  "ucs-2",
  "base64",
  "latin1",
  "binary",
  "hex"
] as const;
type Encodings = typeof encodings[number];
export function requireEncoding(
  maybeEncoding: string,
  context: string
): asserts maybeEncoding is Encodings {
  // any here because of https://github.com/microsoft/TypeScript/issues/26255
  if (!encodings.includes(maybeEncoding as any))
    throw new Error(`Unknown encoding of ${context}: ${maybeEncoding}`);
}

/**
 * Extracts the EIP number from a given filename (or returns null)
 * @param filename EIP filename
 */
export const requireFilenameEipNum = (filename: string) => {
  const eipNumMatch = filename.match(EIP_NUM_RE);
  if (!eipNumMatch || eipNumMatch[1] === undefined) {
    throw new Error(`EIP file name must be eip-###.md`);
  }
  return eipNumMatch && parseInt(eipNumMatch[1]);
};

/**
 * compares the diff between the base commit of the PR and
 * the head commit; if no files were found then it will explode
 *
 * @returns {File}
 */
export const requireFiles = async () => {
  const Github = getOctokit(GITHUB_TOKEN);

  const comparison: CompareCommits = await Github.repos
    .compareCommits({
      base: context.payload.pull_request?.base?.sha,
      head: context.payload.pull_request?.head?.sha,
      owner: context.repo.owner,
      repo: context.repo.repo
    })
    .then((res) => {
      return res.data;
    });

  if (!comparison.files) {
    throw new Error(
      [
        "There were no files found to be associated",
        "with the PR within context"
      ].join(" ")
    );
  }

  return comparison.files as Files;
};

export const assertFilePreexisting = (file: NonNullable<File>) => {
  if (file.status === FileStatus.added) {
    return `File with name ${file.filename} is new and new files must be reviewed`;
  } else return;
};

/**
 * Accepts a file and returns whether or not its name is valid
 *
 * @param errors a list to add any errors that occur to
 * @returns {boolean} is the provided file's filename valid?
 */
export const assertValidFilename = (file: NonNullable<File>) => {
  const filename = file.filename;

  // File name is formatted correctly and is in the EIPS folder
  const match = filename.search(FILE_RE);
  if (match === -1) {
    return `Filename ${filename} is not in EIP format 'EIPS/eip-####.md'`;
  }

  // EIP number is defined within the filename and can be parsed
  const filenameEipNum = requireFilenameEipNum(filename);
  if (!filenameEipNum) {
    return `No EIP number was found to be associated with filename ${filename}`;
  }

  return;
};

/**
 * asserts that the eip number in the filename and in the header are the same
 *
 * @returns error or undefined
 */
export const assertFilenameAndFileNumbersMatch = ({ head, base }: FileDiff) => {
  const headMatchesSelf = head.filenameEipNum === head.eipNum;

  if (!headMatchesSelf) {
    return `EIP header in file ${head.name} does not match: ${base.name}`;
  } else return;
};

/**
 * asserts that eip number in both filename and header has not changed
 *
 * @returns error or undefined
 */
export const assertConstantEipNumber = ({ head, base }: FileDiff) => {
  const filenameNumMatches = base.filenameEipNum === head.filenameEipNum;
  const fileNumMatches = base.eipNum === head.eipNum;

  if (!(filenameNumMatches && fileNumMatches)) {
    return [
      `Base EIP has number ${base.eipNum} which was changed`,
      `to head ${head.eipNum}; EIP number changing is not allowd`
    ].join(" ");
  } else return;
};

/**
 * assert that the status hasn't changed, if it hasn't changed then also
 * assert that the given status is one of the auto-mergable statuses
 *
 * @returns error or undefined
 */
export const assertConstantAndValidStatus = ({ head, base }: FileDiff) => {
  if (head.status !== base.status) {
    return [
      `EIP ${base.eipNum} state was changed from ${base.status}`,
      `to ${head.status}`
    ].join(" ");
  } else if (!ALLOWED_STATUSES.has(head.status)) {
    const allowedStatus = [...ALLOWED_STATUSES].join(" or ");
    return `${head.name} is in state ${head.status}, not ${allowedStatus}`;
  } else return;
};
