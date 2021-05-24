export const MERGE_MESSAGE = `
    Hi, I'm a bot! This change was automatically merged because:
    - It only modifies existing Draft, Review, or Last Call EIP(s)
    - The PR was approved or written by at least one author of each modified EIP
    - The build is passing
    `;
export const ALLOWED_STATUSES = new Set(["draft", "last call", "review"]);
export const COMMENT_HEADER =
  "Hi! I'm a bot, and I wanted to automerge your PR, but couldn't because of the following issue(s):\n\n";
export const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";

export enum FrontMatterAttributes {
  status = "status",
  eip = "eip",
  author = "author"
}

export enum EipStatus {
  draft = "draft",
  withdrawn = "withdrawn",
  lastCall = "last call",
  review = "review"
}

export enum FileStatus {
  added = "added"
}

export enum EVENTS {
  pullRequest = "pull_request",
  pullRequestTarget = "pull_request_target",
  pullRequestReview = "pull_request_review"
}

export const EIP_EDITORS = ["@MicahZoltu", "@lightclient"];

export type ERRORS = {
  fileErrors: {
    filePreexistingError?: string;
    validFilenameError?: string;
  };
  headerErrors: {
    matchingEIPNumError?: string;
    constantEIPNumError?: string;
    constantStatusError?: string;
    validStatusError?: string;
  };
  authorErrors: {
    hasAuthorsError?: string;
  };
  approvalErrors: {
    isAuthorApprovedError?: string;
    isEditorApprovedError?: string;
  };
};

/**
 *  A collection of error strings, although confusing the error strings are
 *  define if an error exists and undefined if not; i.e.
 *  `ERRORS.approvalErrors.isAuthorApproved` is truthy if authors have NOT
 *  approved the PR and falsey if they have because in the case that they
 *  have approved the PR no error exists
 */
export const DEFAULT_ERRORS: ERRORS = {
  fileErrors: {},
  headerErrors: {},
  authorErrors: {},
  approvalErrors: {}
};

export const CHECK_STATUS_INTERVAL = 30000;
