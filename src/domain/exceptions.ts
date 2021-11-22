import { Maybe } from "./Types";

export enum Exceptions {
  unexpectedError = "Unexpected Error",
  requirementViolation = "Requirement Violation",
  gracefulTermination = "Graceful Termination"
}

export class UnexpectedError {
  public readonly type = "Unexpected Error";
  constructor(public error: Maybe<string> = null, public data: Maybe<any> = null){}
}

export class RequirementViolation {
  public readonly type = "Requirement Violation";
  constructor(public error: Maybe<string> = null, public data: Maybe<any> = null){}
}

/**
 *  this terminates the program gracefully, meaning that it will not be treated
 *  as an error. This is useful in cases where an invariant violation does not
 *  necessarily mean that the test fails.
 * */
export class GracefulTermination {
  public readonly type = "Graceful Termination"
  constructor(public error: Maybe<string> = null, public data: Maybe<any> = null){}
}

type Handlers = {[key in keyof typeof Exceptions]: (message: string) => any}

/** this is written out on purpose to allow for easier changes where necessary */
export const processError = (err: any, {
  gracefulTermination,
  unexpectedError,
  requirementViolation
}:Handlers) => {
  if (err?.type === Exceptions.gracefulTermination) {
    console.log(JSON.stringify(err.data, null, 2));
    return gracefulTermination(err.error);
  }

  if (err?.type === Exceptions.requirementViolation) {
    console.log(JSON.stringify(err.data, null, 2));
    return requirementViolation(err.error);
  }

  if (err?.type === Exceptions.unexpectedError) {
    console.log(JSON.stringify(err.data, null, 2));
    return unexpectedError(err.error);
  }

  throw err
}
