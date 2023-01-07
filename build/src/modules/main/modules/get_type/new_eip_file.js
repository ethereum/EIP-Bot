"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newEIPFile = void 0;
exports.newEIPFile = {
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
};
//# sourceMappingURL=new_eip_file.js.map