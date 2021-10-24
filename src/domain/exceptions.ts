import { Maybe } from "./Types";

export class UnexpectedError {
  public readonly type = "Unexpected Error";
  constructor(public error: Maybe<string> = null, public data: Maybe<any> = null){}
}

export class RequirementViolation {
  public readonly type = "Requirement Violation";
  constructor(public error: Maybe<string> = null, public data: Maybe<any> = null){}
}
