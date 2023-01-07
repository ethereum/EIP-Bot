"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertValidStatus = void 0;
const domain_1 = require("src/domain");
/**
 * determines if the status of either the base or the head are
 * not auto mergeable. A non-auto mergeable status requires editor
 * approval
 *
 * @returns error or undefined
 */
const assertValidStatus = ({ head, base }) => {
    const allowedStatus = [...domain_1.ALLOWED_STATUSES].join(" or ");
    if (!domain_1.ALLOWED_STATUSES.has(head.status)) {
        return [
            `${head.name} is in state ${head.status} at the head commit,`,
            `not ${allowedStatus}; an EIP editor needs to approve this change`
        ].join(" ");
    }
    else if (!domain_1.ALLOWED_STATUSES.has(base.status)) {
        const allowedStatus = [...domain_1.ALLOWED_STATUSES].join(" or ");
        return [
            `${base.name} is in state ${base.status} at the base commit,`,
            `not ${allowedStatus}; an EIP editor needs to approve this change`
        ].join(" ");
    }
    else
        return;
};
exports.assertValidStatus = assertValidStatus;
//# sourceMappingURL=assert_valid_status.js.map