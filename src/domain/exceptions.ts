import { Maybe } from "./Types";

export enum Exceptions {
  unexpectedError = "Unexpected Error",
  requirementViolation = "Requirement Violation",
  gracefulTermination = "Graceful Termination",
  critical = "Critical Error"
}

export class UnexpectedError {
  public readonly type = "Unexpected Error";

  constructor(
    public error: Maybe<string> = null,
    public data: Maybe<any> = null
  ) {}
}

export class RequirementViolation {
  public readonly type = "Requirement Violation";

  constructor(
    public error: Maybe<string> = null,
    public data: Maybe<any> = null
  ) {}
}

/**
 *  this terminates the program gracefully, meaning that it will not be treated
 *  as an error. This is useful in cases where an invariant violation does not
 *  necessarily mean that the test fails.
 * */
export class GracefulTermination {
  public readonly type = "Graceful Termination";

  constructor(
    public error: Maybe<string> = null,
    public data: Maybe<any> = null
  ) {}
}

/**
 * this is used when something happens and the whole program needs to be stopped
 * immediately, it's generally relevant for things like no PR or failed configs
 * */
export class CriticalError {
  public readonly type = Exceptions.critical;

  constructor(
    public error: Maybe<string> = null,
    public data: Maybe<any> = null
  ) {}
}

type Handlers = {
  [key in keyof typeof Exceptions]: (message: string, data?: any) => any;
};

/**
 * this is written out on purpose to allow for easier changes where necessary
 * it will throw an exception for anything that's not handled
 * */
export const processError = (
  err: any,
  {
    gracefulTermination,
    unexpectedError,
    requirementViolation,
    critical
  }: Partial<Handlers>
) => {
  if (err?.type === Exceptions.gracefulTermination) {
    if (gracefulTermination) return gracefulTermination(err.error, err.data);
  }

  if (err?.type === Exceptions.requirementViolation) {
    if (requirementViolation) return requirementViolation(err.error, err.data);
  }

  if (err?.type === Exceptions.unexpectedError) {
    if (unexpectedError) return unexpectedError(err.error, err.data);
  }

  if (err?.type === Exceptions.critical) {
    if (critical) return critical(err.error, err.data);
  }

  throw err;
};

export type Exception =
  | RequirementViolation
  | UnexpectedError
  | CriticalError
  | GracefulTermination;

export function assertException(
  maybeException
): asserts maybeException is Exception {
  if (!Object.values(Exceptions).includes(maybeException?.type)) {
    // recycles the exception
    throw maybeException;
  }
}
