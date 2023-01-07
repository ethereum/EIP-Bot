"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssertEIP1EditorApprovals = void 0;
const assertions_1 = require("#/assertions");
const domain_1 = require("src/domain");
const utils_1 = require("#/utils");
class AssertEIP1EditorApprovals {
    constructor(getApprovals) {
        this.getApprovals = getApprovals;
        this.assertEIP1EditorApprovals = async (fileDiff) => {
            const approvals = await this.getApprovals();
            const editors = (0, assertions_1.requireEIPEditors)(fileDiff);
            const editorApprovals = approvals.filter((approver) => editors.includes(approver));
            if (editorApprovals.length < domain_1.EIP1_REQUIRED_EDITOR_APPROVALS) {
                return (0, utils_1.multiLineString)(" ")(`Changes to EIP 1 require at least ${domain_1.EIP1_REQUIRED_EDITOR_APPROVALS}`, `unique approvals from editors; there's currently ${editorApprovals.length} approvals;`, `the remaining editors are ${editors
                    .filter((editor) => !editorApprovals.includes(editor))
                    .join(", ")}`);
            }
            else
                return;
        };
    }
}
exports.AssertEIP1EditorApprovals = AssertEIP1EditorApprovals;
//# sourceMappingURL=assert_eip1_editor_approvals.js.map