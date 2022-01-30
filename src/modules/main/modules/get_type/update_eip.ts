import { ERRORS_TYPE_FILTER } from "src/domain";

export const updateEIP: ERRORS_TYPE_FILTER = {
  fileErrors: {
    validFilenameError: null,
    filePreexistingError: false
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
};
