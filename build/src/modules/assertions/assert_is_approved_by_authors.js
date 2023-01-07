"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertIsApprovedByAuthors = void 0;
const assertions_1 = require("#/assertions");
const approvals_1 = require("#/approvals");
const assertIsApprovedByAuthors = async (fileDiff) => {
    const approvals = await (0, approvals_1.getApprovals)();
    const authors = (0, assertions_1.requireAuthors)(fileDiff);
    // there exists an approver who is also an author
    const hasAuthorApproval = !!approvals.find((approver) => authors.includes(approver));
    if (!hasAuthorApproval) {
        return [
            `${fileDiff.head.name} requires approval from one of`,
            `(${authors.join(", ")})`
        ].join(" ");
    }
    else
        return;
};
exports.assertIsApprovedByAuthors = assertIsApprovedByAuthors;
//# sourceMappingURL=assert_is_approved_by_authors.js.map