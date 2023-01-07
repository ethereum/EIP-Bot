"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssertValidFilename = void 0;
const domain_1 = require("src/domain");
const utils_1 = require("#/utils");
class AssertValidFilename {
    constructor({ requireFilenameEipNum }) {
        /**
         * Accepts a file and returns whether or not its name is valid
         *
         * @param errors a list to add any errors that occur to
         * @returns {boolean} is the provided file's filename valid?
         */
        this.assertValidFilename = async (file) => {
            const filename = file.filename;
            // File name is formatted correctly and is in the EIPS folder
            const match = filename.search(domain_1.FILE_RE);
            if (match === -1) {
                return (0, utils_1.multiLineString)(" ")(`Filename ${filename} is not in EIP format 'EIPS/eip-####.md';`, `if this is a new submission (and prior to eip # being given) then`, `format your file like so 'eip-draft_{summary of eip}.md (don't`, `include the braces)`);
            }
            // EIP number is defined within the filename and can be parsed
            // filename is actually path when fetching directly
            const filenameEipNum = await this.requireFilenameEipNum(filename);
            if (!filenameEipNum) {
                return `No EIP number was found to be associated with filename ${filename}`;
            }
            return;
        };
        this.requireFilenameEipNum = requireFilenameEipNum;
    }
}
exports.AssertValidFilename = AssertValidFilename;
//# sourceMappingURL=assert_valid_filename.js.map