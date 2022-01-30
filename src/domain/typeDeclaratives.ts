import _ from "lodash";
import { AND, OR } from "#/utils";
import { ChangeTypes, Encodings, encodings, GITHUB_HANDLE } from "src/domain";
import { CriticalError, RequirementViolation, UnexpectedError } from "src/domain/exceptions";
import { Opaque } from "type-fest";

/** includes a check for NaN and general falsey */
export const isDefined = <T>(
  maybeDefined: T | null | undefined | typeof NaN | [] | {} | ""
): maybeDefined is T => {
  return !OR(
    _.isUndefined(maybeDefined),
    _.isNull(maybeDefined),
    _.isNaN(maybeDefined),
    maybeDefined === "",
    AND(
      OR(_.isObject(maybeDefined), _.isArray(maybeDefined)),
      _.isEmpty(maybeDefined)
    )
  );
};

export function assertDefined<T>(
  maybeDefined: T | null | undefined
): asserts maybeDefined is T {
  if (OR(_.isUndefined(maybeDefined), _.isNull(maybeDefined))) {
    throw new RequirementViolation("A defined assertion was violated");
  }
}

/** Ensures that encodings are as expected by octokit */
export function requireEncoding(
  maybeEncoding: string,
  context: string
): asserts maybeEncoding is Encodings {
  // any here because of https://github.com/microsoft/TypeScript/issues/26255
  if (!encodings.includes(maybeEncoding as any))
    throw new UnexpectedError(
      `Unknown encoding of ${context}: ${maybeEncoding}`
    );
}

export function castTo<CastToThisType>(value: any): CastToThisType {
  return value;
}

type FileNotFound = Opaque<NodeJS.ErrnoException>;
export const isFileNotFound = (err: any): err is FileNotFound => {
  return AND(
    err.response?.status === 404,
    err.response?.data?.message === "Not Found"
  );
};

export const isChangeType = (str: string): str is ChangeTypes => {
  return Object.values(ChangeTypes).includes(str as any);
};

export type GithubHandle = Opaque<string>;

export function assertGithubHandle(
  maybeHandle: string
): asserts maybeHandle is GithubHandle {
  if (!GITHUB_HANDLE.test(maybeHandle)) {
    throw new CriticalError(
      `${maybeHandle} is not a correctly formatted github handle`
    );
  }
}

export function declareType<T>(input: any): asserts input is T {}
