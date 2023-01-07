"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.statusChange = void 0;
exports.statusChange = {
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
//# sourceMappingURL=status_change.js.map