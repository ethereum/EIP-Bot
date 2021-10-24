import { getOctokit } from "@actions/github";
import { EIPCategory, EipStatus, EIPTypes } from "./Constants";
import { Endpoints } from "@octokit/types";
import { FrontMatterResult } from "front-matter";
import { PromiseValue } from "type-fest";
import _ from "lodash";

export type Github = ReturnType<typeof getOctokit>["rest"];

type UnArrayify<T> = T extends (infer U)[] ? U : T;

export type CompareCommits = PromiseValue<
  ReturnType<Github["repos"]["compareCommits"]>
>["data"];
export type PR = PromiseValue<ReturnType<Github["pulls"]["get"]>>["data"];
export type Commit = PromiseValue<
  ReturnType<Github["repos"]["getCommit"]>
>["data"];
export type Files = PromiseValue<
  ReturnType<Github["pulls"]["listFiles"]>
>["data"];
export type File = UnArrayify<Files>;
export type CommitFiles = CompareCommits["base_commit"]["files"];
export type CommitFile = UnArrayify<NonNullable<CommitFiles>>;
export type Repo = PromiseValue<ReturnType<Github["repos"]["get"]>>["data"];

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
  category: Maybe<EIPCategory>;
  type: EIPTypes;
};

export type Maybe<T> = T | null;

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

export type TestResults = { errors: ERRORS } & {
  fileDiff: FileDiff;
  authors?: string[];
};

export enum MockMethods {
  get = "GET",
  post = "POST",
  patch = "PATCH"
}

export type MockRecord = {
  req: {
    method: string; // ValueOf<{ [k in keyof typeof MockMethods]: `${typeof MockMethods[k]}` }>;
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
  developemnt = "development",
  production = "production"
}

export function isMockMethod(method): asserts method is MockMethods {
  if (!Object.values(MockMethods).includes(method)) {
    throw Error(`method ${method} is not a supported mock method`);
  } else {
    return method;
  }
}

export type Results = {
  filename: string;
  errors?: string[];
  mentions?: string[];
}[];

/** includes a check for NaN and general falsey */
export const isDefined = <T>(
  maybeDefined: T | null | undefined | typeof NaN | "" | false | []
): maybeDefined is T => {
  return (
    !_.isUndefined(maybeDefined) &&
    !_.isNull(maybeDefined) &&
    !_.isNaN(maybeDefined) &&
    !maybeDefined
  );
};
