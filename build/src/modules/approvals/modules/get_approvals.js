"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getApprovals = void 0;
const assertions_1 = require("#/assertions");
const infra_1 = require("src/infra");
/**
 * @returns the approvals of the pull request in context
 */
const getApprovals = async () => {
    const pr = await (0, assertions_1.requirePr)();
    const reviews = await infra_1.github.getPullRequestReviews(pr.number);
    // Starting with set to prevent repeats
    const approvals = new Set();
    // Add PR author to approver list
    if (pr.user?.login) {
        approvals.add("@" + pr.user.login.toLowerCase());
    }
    // Only add approvals if the approver has a username
    for (const review of reviews) {
        const isApproval = review.state == "APPROVED";
        const reviewer = review.user?.login;
        if (isApproval && reviewer) {
            approvals.add("@" + reviewer.toLowerCase());
        }
    }
    return [...approvals];
};
exports.getApprovals = getApprovals;
//# sourceMappingURL=get_approvals.js.map