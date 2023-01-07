"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertConstantEipNumber = void 0;
/**
 * asserts that eip number in both filename and header has not changed
 *
 * @returns error or undefined
 */
const assertConstantEipNumber = ({ head, base }) => {
    const filenameNumMatches = base.filenameEipNum === head.filenameEipNum;
    const fileNumMatches = base.eipNum === head.eipNum;
    if (!(filenameNumMatches && fileNumMatches)) {
        return [
            `Base EIP has number ${base.eipNum} which was changed`,
            `to head ${head.eipNum}; EIP number changing is not allowed`
        ].join(" ");
    }
    else
        return;
};
exports.assertConstantEipNumber = assertConstantEipNumber;
//# sourceMappingURL=assert_constant_eip_number.js.map