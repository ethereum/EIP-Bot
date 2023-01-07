"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withdrawnExceptionPurifier = void 0;
const domain_1 = require("src/domain");
const lodash_1 = require("lodash");
const withdrawnExceptionPurifier = (testResults) => {
    const _testResults = (0, lodash_1.cloneDeep)(testResults);
    const { errors, fileDiff } = _testResults;
    const isChangingStatus = !!errors.headerErrors.constantStatusError;
    const isAuthorApproved = !errors.approvalErrors.isAuthorApprovedError;
    const isWithdrawnAtHead = fileDiff?.head.status === domain_1.EipStatus.withdrawn;
    // the author is allowed to change the status to withdrawn without editor approval
    if (isChangingStatus && isAuthorApproved && isWithdrawnAtHead) {
        errors.approvalErrors.isEditorApprovedError = undefined;
        errors.headerErrors.constantStatusError = undefined;
        errors.headerErrors.validStatusError = undefined;
    }
    return {
        ...testResults,
        errors
    };
};
exports.withdrawnExceptionPurifier = withdrawnExceptionPurifier;
//# sourceMappingURL=withdrawn_exceptions.js.map