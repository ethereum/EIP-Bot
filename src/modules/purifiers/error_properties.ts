import { ERRORS } from "src/domain";
import { AND } from "#/utils";

export const is = {
  /**
   * The idea here is that is minor then it would not affect things like
   * whether or not the file name is valid, if the eip num is constant, if
   * it's eip1 etc.
   * */
  minorChange: (errors: ERRORS): boolean => {
    return AND(
      !errors.fileErrors.filePreexistingError,
      !errors.fileErrors.validFilenameError,
      !errors.headerErrors.constantStatusError,
      !errors.headerErrors.constantEIPNumError,
      !errors.headerErrors.matchingEIPNumError,
      !errors.approvalErrors.enoughEditorApprovalsForEIP1Error,
      !errors.authorErrors.hasAuthorsError
    )
  }
}
