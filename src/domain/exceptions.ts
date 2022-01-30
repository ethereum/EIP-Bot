import { Maybe } from "./Types";
import { multiLineString, MultiLineString, OR } from "#/utils";
import _ from "lodash";
import { MAINTAINERS } from "src/domain/Constants";
import { declareType, GithubHandle } from "src/domain/typeDeclaratives";

export enum Exceptions {
  unexpectedError = "Unexpected Error",
  requirementViolation = "Requirement Violation",
  gracefulTermination = "Graceful Termination",
  critical = "Critical Error",
  unhandled = "Unhandled Exception"
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
  [key in keyof Omit<typeof Exceptions, "unhandled">]: (
    message: string,
    data?: any
  ) => any;
} & { unhandled: (error: any) => any };

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
    critical,
    unhandled
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

  if (unhandled) return unhandled(err);

  throw err;
};

export type Exception =
  | RequirementViolation
  | UnexpectedError
  | CriticalError
  | GracefulTermination;

export function isException(maybeException): maybeException is Exception {
  if (!Object.values(Exceptions).includes(maybeException?.type)) {
    // recycles the exception
    return false;
  }
  return true;
}

/**
 * calls function provided and either returns output directly or it
 * processes the error via the standard exception handler.
 * */
export const tryCatch = <Func extends () => any>(
  func: Func,
  handlers: Partial<Handlers>
) => {
  try {
    return func();
  } catch (err) {
    return processError(err, handlers);
  }
};

/** accepts any error object and then builds a meaningful message */
export const getUnhandledErrorMessage = (error: any) => {
  if (!error) {
    return "a critical and unhandled exception occurred but there was no error";
  }

  let message = new MultiLineString(
    `A critical and unhandled exception has occurred:`
  );

  const hasErrMessage = OR(!!error.error, !!error.message?.toLowerCase());
  if (hasErrMessage) {
    error.error && message.addLine(`\tMessage: ${error.error}`);
    error.message &&
      message.addLine(`\tMessage: ${error.message?.toLowerCase()}`);
  } else {
    message.addLine(`\tMessage: (no error message was provided)`);
  }

  const hasErrData = !OR(_.isNil(error.data), _.isEmpty(error.data));
  if (hasErrData) {
    message.addLine(`\tData:`);
    message.addLine(`${JSON.stringify(error.data, null, 2)}`);
  } else {
    message.addLine(`\tData: (there is no data for this error)`);
  }

  const hasNeitherDataNorMessage = !OR(hasErrMessage, hasErrData);
  if (hasNeitherDataNorMessage) {
    message.addLine(
      `Raw Stringified Error: (doing this because no message or data)`
    );
    message.addLine(JSON.stringify(error, null, 2));
  }

  return message.message;
};

export const getMaintainersString = () => {
  const maintainers: {
    success: boolean;
    value: string | [GithubHandle, ...GithubHandle[]];
  } = tryCatch(
    () => {
      return {
        success: true,
        value: MAINTAINERS()
      };
    },
    {
      critical: (message) => {
        return {
          success: false,
          value: message
        };
      },
      // this will run for any error type other than critical
      unhandled: (error) => {
        return {
          success: false,
          value: getUnhandledErrorMessage(error)
        };
      }
    }
  );

  if (maintainers.success) {
    declareType<[GithubHandle, ...GithubHandle[]]>(maintainers.value);
    return `(cc ${maintainers.value.join(", ")})`;
  }

  declareType<string>(maintainers.value);
  return multiLineString("\n")(
    `An error occurred while mentioning maintainers:`,
    `\t` + maintainers.value
  );
};
