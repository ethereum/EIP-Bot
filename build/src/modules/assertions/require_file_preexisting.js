"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequireFilePreexisting = void 0;
const domain_1 = require("src/domain");
const exceptions_1 = require("src/domain/exceptions");
const utils_1 = require("#/utils");
class RequireFilePreexisting {
    constructor(requirePr, getRepoFilenameContent) {
        this.requirePr = requirePr;
        this.getRepoFilenameContent = getRepoFilenameContent;
    }
    /**
     *  accepts a standard File object and throws an error if the status is new or
     *  it does not exist at the base commit; uses the file's previous_filename if
     *  it exists.
     */
    async requireFilePreexisting(file) {
        const pr = await this.requirePr();
        const filename = file.previous_filename || file.filename;
        if (!(0, domain_1.isDefined)(filename)) {
            throw new exceptions_1.UnexpectedError((0, utils_1.multiLineString)(" ")(`the file did not have a previous or current`, `filename associated with it`), {
                pr,
                file
            });
        }
        const error = await this.getRepoFilenameContent(filename, pr.base.sha).catch((err) => err);
        if (((0, domain_1.isDefined)(error) && error.status === 404) ||
            file.status === domain_1.FileStatus.added) {
            throw new exceptions_1.RequirementViolation((0, utils_1.multiLineString)(" ")(`File with name ${filename} is new and new files must be reviewed`));
        }
        return file;
    }
}
exports.RequireFilePreexisting = RequireFilePreexisting;
//# sourceMappingURL=require_file_preexisting.js.map