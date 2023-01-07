"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertFilenameAndFileNumbersMatch = void 0;
/**
 * asserts that the eip number in the filename and in the header are the same
 *
 * @returns error or undefined
 */
const assertFilenameAndFileNumbersMatch = ({ head, base }) => {
    const headMatchesSelf = head.filenameEipNum === head.eipNum;
    if (!headMatchesSelf) {
        return `EIP header in file ${head.name} does not match: ${base.name}`;
    }
    else
        return;
};
exports.assertFilenameAndFileNumbersMatch = assertFilenameAndFileNumbersMatch;
//# sourceMappingURL=assert_filename_and_file_numbers_match.js.map