import { getOctokit } from "@actions/github";
import { ChangeTypes, EIPCategory, EipStatus, EIPTypes } from "./Constants";
import { FrontMatterResult } from "front-matter";
import { PromiseValue } from "type-fest";
import { CriticalError } from "src/domain/exceptions";

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
export type File = Files[number];
export type CommitFiles = CompareCommits["base_commit"]["files"];
export type CommitFile = UnArrayify<NonNullable<CommitFiles>>;
export type Repo = PromiseValue<ReturnType<Github["repos"]["get"]>>["data"];
export type GithubSelf = PromiseValue<
  ReturnType<Github["users"]["getAuthenticated"]>
>["data"];
export type IssueComments = PromiseValue<
  ReturnType<Github["issues"]["listComments"]>
>["data"];

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

export type ContentData = PromiseValue<
  ReturnType<Github["repos"]["getContent"]>
>["data"];

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

type LeafsToBoolean<O> = {
  [K in keyof O]: O[K] extends Record<any, any>
    ? Required<LeafsToBoolean<O[K]>>
    : boolean | null;
};

/**
 * this type is used to define filter definitions for different change types; the
 * type of a change should be distinguishable by the errors alone. Each leaf
 * can be either true, false, or null where
 * - true: an error exists for this leaf
 * - false: an error does not exist for this leaf
 * - null: either
 * */
export type ERRORS_TYPE_FILTER = LeafsToBoolean<ERRORS>;

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
    throw new CriticalError(`method ${method} is not a supported mock method`);
  } else {
    return method;
  }
}

export type Result = {
  filename: string;
  successMessage?: string;
  errors?: string[];
  mentions?: string[];
  type: ChangeTypes;
};

export type Results = Result[];

export type PropsValue<T extends (...args: any[]) => any> = T extends (
  ...args: infer Props
) => any
  ? Props
  : never;

export type MockedFunctionObject<
  Obj extends Record<string, (...args: any[]) => any>
> = { [key in keyof Obj]?: jest.MockedFunction<Obj[key]> };
