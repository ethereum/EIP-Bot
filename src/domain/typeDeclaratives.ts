import _ from "lodash";
import { OR, AND } from "#/utils";
import { Encodings, encodings } from "src/domain";

/** includes a check for NaN and general falsey */
export const isDefined = <T>(
  maybeDefined: T | null | undefined | typeof NaN | [] | {}
): maybeDefined is T => {
  return !OR(
    _.isUndefined(maybeDefined),
    _.isNull(maybeDefined),
    _.isNaN(maybeDefined),
    AND(
      OR(
        _.isObject(maybeDefined),
        _.isArray(maybeDefined)
      ),
      _.isEmpty(maybeDefined)
    )
  );
};

export function assertDefined<T>(
  maybeDefined: T | null | undefined
): asserts maybeDefined is T {
  if (OR(_.isUndefined(maybeDefined), _.isNull(maybeDefined))) {
    throw new Error("A defined assertion was violated");
  }
}

/** Ensures that encodings are as expected by octokit */
export function requireEncoding(
  maybeEncoding: string,
  context: string
): asserts maybeEncoding is Encodings {
  // any here because of https://github.com/microsoft/TypeScript/issues/26255
  if (!encodings.includes(maybeEncoding as any))
    throw new Error(`Unknown encoding of ${context}: ${maybeEncoding}`);
}

export function castTo<CastToThisType>(value: any): CastToThisType {
  return value;
}
