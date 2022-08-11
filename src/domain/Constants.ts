import { Opaque } from "type-fest";
import { ERRORS, Maybe, NodeEnvs } from "./Types";
import { AND } from "#/utils";
import { CriticalError, RequirementViolation, UnexpectedError } from "src/domain/exceptions";
import { assertGithubHandle, GithubHandle } from "./typeDeclaratives";
import _ from "lodash";

// this is meant to be a public key associated with a orphaned account;
// it is encoded / decoded here because github will invalidate it if it knows
// that its public (so shhh); also this key will never expire
export const PUBLIC_GITHUB_KEY = Buffer.from(
  "Z2hwX1hvVVBlcFpTUkdWWmFVdDRqOW44SHFSUloxNVlIZTFlNW82bw==",
  "base64"
).toString("ascii");

export const MERGE_MESSAGE = `
    Hi, I'm a bot! This change was automatically merged because:
    - It only modifies existing Draft, Review, or Last Call EIP(s)
    - The PR was approved or written by at least one author of each modified EIP
    - The build is passing
    `;

export const COMMENT_HEADER =
  "Hi! I'm a bot, and I wanted to automerge your PR, but couldn't because of the following issue(s):\n\n";
export const GITHUB_TOKEN = process.env.GITHUB_TOKEN || PUBLIC_GITHUB_KEY;

const handleStringToArray = (str?: string) =>
  str && str.split(",").map((str) => str.trim());

export function assertEditorsFormat(
  maybeEditors: string[] | undefined | ""
): asserts maybeEditors is [GithubHandle, ...GithubHandle[]] {
  if (!maybeEditors || !maybeEditors.length) {
    console.log(
      [
        `at least one editor must be provided, you provided these environment variables`,
        `\tERC_EDITORS: ${process.env.ERC_EDITORS}`,
        `\tCORE_EDITORS: ${process.env.CORE_EDITORS}`,
        `these were then parsed to become`,
        `\tERC_EDITORS: ${JSON.stringify(
          handleStringToArray(process.env.ERC_EDITORS)
        )}`,
        `\tCORE_EDITORS: ${JSON.stringify(
          handleStringToArray(process.env.CORE_EDITORS)
        )}`
      ].join("\n")
    );
    throw new CriticalError("at least one editor must be provided");
  }

  for (const maybeEditor of maybeEditors) {
    assertGithubHandle(maybeEditor);
  }
}

export function assertMaintainersFormat(
  maybeMaintainers: string[] | undefined | ""
): asserts maybeMaintainers is [GithubHandle, ...GithubHandle[]] {
  if (_.isNil(maybeMaintainers) || _.isEmpty(maybeMaintainers)) {
    console.log(`MAINTAINERS: ${process.env.MAINTAINERS}`);
    throw new CriticalError("at least one maintainer must be provided");
  }

  for (const maybeMaintainer of maybeMaintainers) {
    assertGithubHandle(maybeMaintainer);
  }
}

const getEditors = (envEditors?: string) => {
  const editors = handleStringToArray(envEditors);
  assertEditorsFormat(editors);
  return editors;
};
const getMaintainers = (envMaintainers?: string) => {
  const maintainers = handleStringToArray(envMaintainers);
  assertMaintainersFormat(maintainers);
  return maintainers;
};
/** don't use this directly, use `requireCoreEditors` instead */
export const CORE_EDITORS = () => getEditors(process.env.CORE_EDITORS);
/** don't use this directly, use `requireERCEditors` instead */
export const ERC_EDITORS = () => getEditors(process.env.ERC_EDITORS);
/** don't use this directly, use `requireERCEditors` instead */
export const NETWORKING_EDITORS = () =>
  getEditors(process.env.NETWORKING_EDITORS);
/** don't use this directly, use `requireERCEditors` instead */
export const INTERFACE_EDITORS = () =>
  getEditors(process.env.INTERFACE_EDITORS);
/** don't use this directly, use `requireERCEditors` instead */
export const META_EDITORS = () => getEditors(process.env.META_EDITORS);
/** don't use this directly, use `requireERCEditors` instead */
export const INFORMATIONAL_EDITORS = () =>
  getEditors(process.env.INFORMATIONAL_EDITORS);
/**
 * dont' use this directly, it can explode and break error handling,
 * so use `getMaintainersString` instead where relevant
 * */
export const MAINTAINERS = () => {
  return getMaintainers(process.env.MAINTAINERS);
};

export enum FrontMatterAttributes {
  status = "status",
  eip = "eip",
  author = "author",
  category = "category",
  type = "type"
}

export enum EIPCategory {
  erc = "erc",
  core = "core",
  networking = "networking",
  interface = "interface"
}

export enum EIPTypes {
  informational = "informational",
  meta = "meta",
  standardsTrack = "standards track"
}

export const EIPTypeOrCategoryToResolver = {
  [EIPCategory.erc]: "ERC_EDITORS",
  [EIPCategory.core]: "CORE_EDITORS",
  [EIPCategory.interface]: "INTERFACE_EDITORS",
  [EIPCategory.networking]: "NETWORKING_EDITORS",
  [EIPTypes.meta]: "META_EDITORS",
  [EIPTypes.informational]: "INFORMATIONAL_EDITORS"
};

/** asserts a string's type is within EIPCategory */
export function assertIsCategoryEnum(
  maybeCategory: string,
  fileName: string
): asserts maybeCategory is EIPCategory {
  const categories = Object.values(EIPCategory) as string[];
  if (!categories.includes(maybeCategory)) {
    throw new RequirementViolation(
      [
        `the provided eip category '${maybeCategory}' of file`,
        `'${fileName}' is required to be one of (${categories.join(", ")})`
      ].join(" ")
    );
  }
}

export function assertIsTypeEnum(
  maybeType: string,
  fileName: string
): asserts maybeType is EIPTypes {
  const types = Object.values(EIPTypes) as string[];
  if (!types.includes(maybeType)) {
    throw new RequirementViolation(
      [
        `the provided eip type is '${maybeType}' of file`,
        `'${fileName}' is required to be one of (${types.join(", ")})`
      ].join(" ")
    );
  }
}

export const assertCategory = ({
  fileName,
  maybeCategory,
  maybeType
}: {
  fileName: string;
  maybeCategory: Maybe<string>;
  maybeType: Maybe<string>;
}): {
  category: Maybe<EIPCategory>;
  type: EIPTypes;
} => {
  if (!maybeType) {
    throw new RequirementViolation(
      `A 'type' header is required for all EIPs, '${fileName}' does not have a 'type'`
    );
  }
  const normalizedType = maybeType.toLowerCase();
  assertIsTypeEnum(normalizedType, fileName);

  if (normalizedType === EIPTypes.informational) {
    return {
      category: null,
      type: EIPTypes.informational
    };
  }

  if (normalizedType === EIPTypes.meta) {
    return {
      category: null,
      type: EIPTypes.meta
    };
  }

  if (normalizedType === EIPTypes.standardsTrack) {
    const normalized = maybeCategory?.toLowerCase();
    if (!normalized) {
      throw new RequirementViolation(
        [
          `'${fileName}' does not have a 'category' property, but it MUST`,
          `be set for eips that are type ${EIPTypes.standardsTrack}`
        ].join(" ")
      );
    }
    assertIsCategoryEnum(normalized, fileName);
    return {
      category: normalized,
      type: EIPTypes.standardsTrack
    };
  }

  throw new UnexpectedError(
    "type was not a known type, this error should never occur"
  );
};

export enum EipStatus {
  draft = "draft",
  withdrawn = "withdrawn",
  lastCall = "last call",
  review = "review",
  final = "final",
  living = "living"
}

export enum FileStatus {
  added = "added"
}

export enum EVENTS {
  pullRequest = "pull_request",
  pullRequestTarget = "pull_request_target",
  pullRequestReview = "pull_request_review"
}

export enum ChangeTypes {
  newEIPFile = "newEIPFile",
  statusChange = "statusChange",
  updateEIP = "updateEIP",
  ambiguous = "ambiguous"
}

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

export const EIP1_REQUIRED_EDITOR_APPROVALS = 5;

export const isTest = () => {
  return process.env.NODE_ENV === NodeEnvs.test;
};
export const isMock = () => {
  return process.env.NODE_ENV === NodeEnvs.mock;
};

export const isProd = () => {
  return process.env.NODE_ENV === NodeEnvs.production;
};

export const isDevelopment = () => {
  return process.env.NODE_ENV === NodeEnvs.developemnt;
};

type NockNoMatchingRequest = Opaque<NodeJS.ErrnoException>;
export const isNockNoMatchingRequest = (
  err: any
): err is NockNoMatchingRequest => {
  if (isMock()) {
    const message = err.message?.toLowerCase();
    if (!message) return false;
    return AND(
      /nock/.test(message),
      /method/.test(message),
      /url/.test(message),
      /no match/.test(message)
    );
  }
  return false;
};

type NockDisallowedNetConnect = Opaque<NodeJS.ErrnoException>;
export const isNockDisallowedNetConnect = (
  err: any
): err is NockDisallowedNetConnect => {
  if (isMock()) {
    const message = err.message?.toLowerCase();
    if (!message) return false;
    return AND(
      /nock/.test(message),
      /disallowed/.test(message),
      /request.*failed/.test(message),
      /net connect/.test(message)
    );
  }
  return false;
};

export const ALLOWED_STATUSES = new Set([
  EipStatus.draft,
  EipStatus.lastCall,
  EipStatus.review
]);
