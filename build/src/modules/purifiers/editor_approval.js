"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editorApprovalPurifier = void 0;
const domain_1 = require("src/domain");
const lodash_1 = require("lodash");
const utils_1 = require("#/utils");
const status_change_allowed_1 = require("./status_change_allowed");
const editorApprovalPurifier = (testResults) => {
    const _testResults = (0, lodash_1.cloneDeep)(testResults);
    const { errors, fileDiff } = _testResults;
    const isEditorApproved = !errors.approvalErrors.isEditorApprovedError;
    const isNewFile = !!errors.fileErrors.filePreexistingError;
    // I call the purifier because we shouldn't mention editors if
    // the status change is allowed
    const statusChangedAllowed = !(0, status_change_allowed_1.statusChangeAllowedPurifier)(testResults).errors.headerErrors
        .constantStatusError;
    const isInvalidStatus = !!errors.headerErrors.validStatusError;
    const isAuthorApproved = !errors.approvalErrors.isAuthorApprovedError;
    const isFinal = (0, utils_1.OR)(fileDiff.head.status === domain_1.EipStatus.final, fileDiff.base.status === domain_1.EipStatus.final);
    if (isEditorApproved && isNewFile) {
        errors.fileErrors.filePreexistingError = undefined;
    }
    if (isEditorApproved) {
        errors.headerErrors.validStatusError = undefined;
    }
    const mentionEditors = (0, utils_1.OR)(!isEditorApproved && isNewFile, !isEditorApproved && isInvalidStatus, !isEditorApproved && !statusChangedAllowed, 
    // Final EIPs should first get author approval then mention editors
    !isEditorApproved && isAuthorApproved && isFinal);
    if (!mentionEditors) {
        errors.approvalErrors.isEditorApprovedError = undefined;
    }
    return { ...testResults, errors };
};
exports.editorApprovalPurifier = editorApprovalPurifier;
//# sourceMappingURL=editor_approval.js.map