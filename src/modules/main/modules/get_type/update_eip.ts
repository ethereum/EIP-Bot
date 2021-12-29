import { ERRORS_TYPE_FILTER } from "src/domain";

export const updateEIP: ERRORS_TYPE_FILTER = {
  fileErrors: {
    validFilenameError: false,
    filePreexistingError: false
  },
  headerErrors: {
    matchingEIPNumError: false,
    constantEIPNumError: false,
    constantStatusError: false,
    validStatusError: false
  },
  authorErrors: {
    hasAuthorsError: false
  },
  approvalErrors: {
    isAuthorApprovedError: false,
    isEditorApprovedError: false,
    enoughEditorApprovalsForEIP1Error: false
  }
}
