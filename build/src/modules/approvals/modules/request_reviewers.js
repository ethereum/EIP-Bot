"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestReviewers = void 0;
const domain_1 = require("src/domain");
const assertions_1 = require("#/assertions");
const infra_1 = require("src/infra");
/**
 * Attempts to request a review and returns a list of unchanged users
 * that were failed to request
 *
 * @param reviewers list of github handles or emails to request
 * @returns list of github handles or emails that failed to be requested
 * likely because they are not contributors in the EIPs repo
 */
const requestReviewers = async (reviewers) => {
    const pr = await (0, assertions_1.requirePr)();
    const requestReviewer = async (reviewer) => {
        const res = await infra_1.github.requestReview(pr, reviewer);
        return !res && reviewer;
    };
    const requested = await Promise.all(reviewers.map(requestReviewer));
    return requested.filter(domain_1.isDefined);
};
exports.requestReviewers = requestReviewers;
//# sourceMappingURL=request_reviewers.js.map