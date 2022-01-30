import { ERRORS_TYPE_FILTER } from "src/domain";

export const statusChange: ERRORS_TYPE_FILTER = {
  fileErrors: {
    validFilenameError: false,
    filePreexistingError: false
  },
  headerErrors: {
    matchingEIPNumError: false,
    constantEIPNumError: false,
    constantStatusError: true,
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
};
