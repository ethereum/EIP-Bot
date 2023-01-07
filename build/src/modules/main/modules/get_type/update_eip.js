"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateEIP = void 0;
exports.updateEIP = {
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
//# sourceMappingURL=update_eip.js.map