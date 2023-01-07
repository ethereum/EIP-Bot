"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.statusChangeAllowedPurifier = void 0;
const domain_1 = require("src/domain");
const lodash_1 = require("lodash");
const utils_1 = require("#/utils");
const statusChangeAllowedPurifier = (testResults) => {
    const _testResults = (0, lodash_1.cloneDeep)(testResults);
    const { errors, fileDiff } = _testResults;
    const isStatusChangeAllowed = (0, utils_1.ANY)([
        // state changes from lastcall -> review
        fileDiff?.base.status === domain_1.EipStatus.lastCall &&
            fileDiff?.head.status === domain_1.EipStatus.review,
        // editors can approve state changes
        !errors.approvalErrors.isEditorApprovedError
    ]);
    if (isStatusChangeAllowed) {
        // always clear the constant status error if changes are allowed
        errors.headerErrors.constantStatusError = undefined;
    }
    return {
        ...testResults,
        errors
    };
};
exports.statusChangeAllowedPurifier = statusChangeAllowedPurifier;
//# sourceMappingURL=status_change_allowed.js.map