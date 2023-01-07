"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertEIPEditorApproval = void 0;
const approvals_1 = require("#/approvals");
const assertions_1 = require("#/assertions");
/** returns an error string if the PR does NOT have editor approval */
const assertEIPEditorApproval = async (fileDiff) => {
    const approvals = await (0, approvals_1.getApprovals)();
    const editors = (0, assertions_1.requireEIPEditors)(fileDiff);
    const isApproved = approvals.find((approver) => editors.includes(approver));
    if (!isApproved) {
        return `This PR requires review from one of [${editors.join(", ")}]`;
    }
    else
        return;
};
exports.assertEIPEditorApproval = assertEIPEditorApproval;
//# sourceMappingURL=assert_eip_editor_approval.js.map