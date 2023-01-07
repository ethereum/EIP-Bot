"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertConstantStatus = void 0;
/**
 * assert that the status hasn't changed, if it hasn't changed then also
 * assert that the given status is one of the auto-mergable statuses
 *
 * @returns error or undefined
 */
const assertConstantStatus = ({ head, base }) => {
    if (head.status !== base.status) {
        return [
            `eip-${base.eipNum} state was changed from ${base.status}`,
            `to ${head.status}`
        ].join(" ");
    }
    else
        return;
};
exports.assertConstantStatus = assertConstantStatus;
//# sourceMappingURL=assert_constant_status.js.map