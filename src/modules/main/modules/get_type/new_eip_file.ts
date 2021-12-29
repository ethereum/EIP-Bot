import { ERRORS_TYPE_FILTER } from "src/domain";

export const newEIPFile: ERRORS_TYPE_FILTER = {
  fileErrors: {
    validFilenameError: null,
    filePreexistingError: true
  },
  headerErrors: {
    matchingEIPNumError: null,
    constantEIPNumError: null,
    constantStatusError: false,
    validStatusError: null
  },
  authorErrors: {
    hasAuthorsError: null
  },
  approvalErrors: {
    isAuthorApprovedError: null,
    isEditorApprovedError: null,
    enoughEditorApprovalsForEIP1Error: null
  }
}
