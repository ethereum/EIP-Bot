import { context, getOctokit } from "@actions/github";
import { RequestError } from "@octokit/types";
import {
  ALLOWED_STATUSES,
  EIP1_REQUIRED_EDITOR_APPROVALS,
  EIP_NUM_RE,
  encodings,
  EVENTS,
  File,
  FileDiff,
  Files,
  FileStatus,
  FILE_RE,
  GITHUB_TOKEN,
  PR,
  Encodings,
  EIP_EDITORS
} from "src/utils";
import { getApprovals, getJustLogin } from "./CheckApprovals";

export const requireEvent = () => {
  const event = context.eventName;

  const isPullRequestReview = event === EVENTS.pullRequestReview;
  const isPullRequestTarget = event === EVENTS.pullRequestTarget;
  if (!(isPullRequestReview || isPullRequestTarget)) {
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

  if (pr.merged && process.env.NODE_ENV !== "development") {
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
export const requireAuthors = (fileDiff: FileDiff): string[] => {
  // take from base to avoid people adding themselves and being able to approve
  const authors = fileDiff.base.authors && [...fileDiff.base.authors];

  // Make sure there are authors
  if (!authors || authors.length === 0) {
    throw `${fileDiff.head.name} has no identifiable authors who can approve the PR (only considering the base version)`;
  }

  return authors;
};

/** Ensures that encodings are as expected by octokit */
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
export const requireFiles = async (pr: PR) => {
  const Github = getOctokit(GITHUB_TOKEN);

  const files = await Github.pulls
    .listFiles({
      pull_number: pr.number,
      repo: context.repo.repo,
      owner: context.repo.owner
    })
    .then((res) => res.data);

  if (!files?.length) {
    throw new Error(
      [
        "There were no files found to be associated",
        "with the PR within context"
      ].join(" ")
    );
  }

  return files as Files;
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
export const assertConstantStatus = ({ head, base }: FileDiff) => {
  if (head.status !== base.status) {
    return [
      `EIP ${base.eipNum} state was changed from ${base.status}`,
      `to ${head.status}`
    ].join(" ");
  } else return;
};

/**
 * determines if the status of either the base or the head are
 * not auto mergeable. A non-auto mergeable status requires editor
 * approval
 *
 * @returns error or undefined
 */
export const assertValidStatus = ({ head, base }: FileDiff) => {
  const allowedStatus = [...ALLOWED_STATUSES].join(" or ");
  if (!ALLOWED_STATUSES.has(head.status)) {
    return [
      `${head.name} is in state ${head.status} at the head commit,`,
      `not ${allowedStatus}; an EIP editor needs to approve this change`
    ].join(" ");
  } else if (!ALLOWED_STATUSES.has(base.status)) {
    const allowedStatus = [...ALLOWED_STATUSES].join(" or ");
    return [
      `${base.name} is in state ${base.status} at the base commit,`,
      `not ${allowedStatus}; an EIP editor needs to approve this change`
    ].join(" ");
  } else return;
};

// this has an injected dependency to make testing easier
export const _requireFilePreexisting = (_requirePr: typeof requirePr) => async (
  file: File
) => {
  const Github = getOctokit(GITHUB_TOKEN);
  const pr = await _requirePr();
  const filename = file.previous_filename || file.filename;
  const error = await Github.repos
    .getContent({
      owner: context.repo.owner,
      repo: context.repo.repo,
      path: filename,
      ref: pr.base.sha
    })
    .catch((err) => err as RequestError);

  if ((error && error.status === 404) || file.status === FileStatus.added) {
    throw `File with name ${filename} is new and new files must be reviewed`;
  }

  return file;
};

/**
 *  accepts a standard File object and throws an error if the status is new or
 *  it does not exist at the base commit; uses the file's previous_filename if
 *  it exists.
 */
export const requireFilePreexisting = _requireFilePreexisting(requirePr);

// injected to make testing easier
export const _requireEIPEditors = (
  _requireAuthors: typeof requireAuthors,
  EDITORS: string[]
) => (fileDiff?: FileDiff) => {
  // TODO: find a better way to do this

  if (fileDiff) {
    const authors = _requireAuthors(fileDiff);
    return EDITORS.filter((editor) => !authors.includes(editor));
  } else {
    console.warn(
      [
        "You are requesting all of the EIP_EDITORS, but an edgecase may exist where",
        "an editor is also an author; it's recommended that you instead request the",
        "editors with respect to a fileDiff"
      ].join(" ")
    );
    return EDITORS;
  }
};
/**
 * returns the list of EIP editors, optionally removes any that may also be authors
 * if a file diff is provided
 */
export const requireEIPEditors = _requireEIPEditors(
  requireAuthors,
  EIP_EDITORS
);

/** returns an error string if the PR does NOT have editor approval */
export const assertEIPEditorApproval = async (fileDiff: FileDiff) => {
  const approvals = await getApprovals();
  const editors = requireEIPEditors(fileDiff);

  const isApproved = approvals.find((approver) => editors.includes(approver));
  if (!isApproved) {
    return `This PR requires review from one of [${editors.join(", ")}]`;
  } else return;
};

export const assertEIP1EditorApprovals = async (fileDiff: FileDiff) => {
  const approvals = await getApprovals();

  const editors = requireEIPEditors(fileDiff);
  const editorApprovals = approvals.filter((approver) =>
    editors.includes(approver)
  );
  if (editorApprovals.length < EIP1_REQUIRED_EDITOR_APPROVALS) {
    return [
      `Changes to EIP 1 require at least ${EIP1_REQUIRED_EDITOR_APPROVALS}`,
      `unique approvals from editors, the editors are [${editors.join(", ")}]`
    ].join(" ");
  } else return;
};
