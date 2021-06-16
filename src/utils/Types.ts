import { getOctokit } from "@actions/github";
import { EipStatus } from "./Constants";
import { Endpoints } from "@octokit/types";
import { FrontMatterResult } from "front-matter";

export type Github = ReturnType<typeof getOctokit>;
const Github = getOctokit("fake");

export type UnPromisify<T> = T extends Promise<infer U> ? U : T;
type UnArrayify<T> = T extends (infer U)[] ? U : T;

export type CompareCommits = UnPromisify<
  ReturnType<typeof Github.repos.compareCommits>
>["data"];
export type PR = UnPromisify<ReturnType<typeof Github.pulls.get>>["data"];
export type Commit = UnPromisify<
  ReturnType<typeof Github.repos.getCommit>
>["data"];
export type Files = CompareCommits["files"];
export type File = UnArrayify<CompareCommits["files"]>;
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

export type ContentResponse = Endpoints["GET /repos/{owner}/{repo}/contents/{path}"]["response"]["data"];

export type EIP = {
  number: string;
  status: EipStatus;
  authors: Set<string>;
};

export type FormattedFile = {
  eipNum: number;
  status: EipStatus;
  authors?: Set<string>;
  name: string;
  filenameEipNum: number;
};

export type ParsedContent = {
  path: string;
  name: string;
  content: FrontMatterResult<any>;
};

export type FileDiff = {
  head: FormattedFile;
  base: FormattedFile;
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
  };
};

export type TestResults = { errors: ERRORS} & { fileDiff: FileDiff; authors?: string[] }
