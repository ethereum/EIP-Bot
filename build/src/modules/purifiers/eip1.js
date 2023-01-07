"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EIP1Purifier = void 0;
const lodash_1 = require("lodash");
const EIP1Purifier = (testResults) => {
    const { errors } = (0, lodash_1.cloneDeep)(testResults);
    const eipNum = testResults.fileDiff.base.eipNum;
    if (eipNum === 1) {
        // authors not required for EIP1
        errors.approvalErrors.isAuthorApprovedError = undefined;
        // eip-1 doesn't have authors that are discernible so it can be ignored
        errors.authorErrors.hasAuthorsError = undefined;
        // this is a repeat of hasEnoughEditorApprovals
        errors.approvalErrors.isEditorApprovedError = undefined;
        // eip-1 must be reviewed by multiple editors, so we can allowed it to be
        // any status without saying so
        errors.headerErrors.validStatusError = undefined;
    }
    else {
        errors.approvalErrors.enoughEditorApprovalsForEIP1Error = undefined;
    }
    // clear error in all other cases
    return { ...testResults, errors };
};
exports.EIP1Purifier = EIP1Purifier;
//# sourceMappingURL=eip1.js.map