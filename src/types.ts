import { getOctokit } from "@actions/github";
import { Endpoints } from "@octokit/types";
import { FrontMatterResult } from "front-matter";

export type Github = ReturnType<typeof getOctokit>["rest"];
const Github = getOctokit("fake").rest;

export type UnPromisify<T> = T extends Promise<infer U> ? U : T;
export type UnArrayify<T> = T extends (infer U)[] ? U : T;

export type CompareCommits = UnPromisify<
  ReturnType<typeof Github.repos.compareCommits>
>["data"];
export type PR = UnPromisify<ReturnType<typeof Github.pulls.get>>["data"];
export type SearchPR = UnPromisify<
  ReturnType<typeof Github["search"]["issuesAndPullRequests"]>
>["data"]["items"][number];
export type Commit = UnPromisify<
  ReturnType<typeof Github.repos.getCommit>
>["data"];
export type Comment = UnPromisify<
  ReturnType<typeof Github["issues"]["listComments"]>
>["data"][number];
export type Files = UnPromisify<
  ReturnType<Github["pulls"]["listFiles"]>
>["data"];
export type File = UnArrayify<Files>;
export type CommitFiles = CompareCommits["base_commit"]["files"];
export type CommitFile = UnArrayify<NonNullable<CommitFiles>>;
export type Repo = UnPromisify<ReturnType<typeof Github.repos.get>>["data"];

// This was extracted directly from Octokit repo
// node_modules/@octokit/openapi-types/generated/types.ts : 7513 - 7553
export type ContentFile = {
  type: string;
  encoding: string;
  size: number;
  name: string;
  path: string;
  content: string;
  sha: string;
  url: string;
  git_url: string | null;
  html_url: string | null;
  download_url: string | null;
  _links: {
    git: string | null;
    html: string | null;
    self: string;
  };
  target?: string;
  submodule_git_url?: string;
};

export type ContentResponse =
  Endpoints["GET /repos/{owner}/{repo}/contents/{path}"]["response"]["data"];

export type ParsedContent = {
  path: string;
  name: string;
  content: FrontMatterResult<any>;
};

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
    enoughEditorApprovalsForEIP1Error?: string;
  };
};

export const encodings = [
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
export type Encodings = typeof encodings[number];

export enum MockMethods {
  get = "GET",
  post = "POST"
}

export type MockRecord = {
  req: {
    method: MockMethods;
    url: string;
  };
  res: {
    status: number;
    data: any;
  };
};

export enum NodeEnvs {
  test = "test",
  mock = "MOCK",
  developemnt = "development"
}

export type ArrayLike<T> = T extends (infer U)[] ? U[] : never;
export type PreExistingPR = {
  path: string;
  num: number;
  createdAt?: moment.Moment;
  author?: string;
  branch: string;
};
