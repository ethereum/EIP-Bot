"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireMaxFileNumber = void 0;
const github_1 = require("src/infra/github");
class TooManyFilesError extends Error {
    constructor(message) {
        super(message);
        this.name = "TooManyFilesError";
    }
}
const requireMaxFileNumber = async (pr) => {
    const max_files_allowed = 25;
    const files = await github_1.github.getPullRequestFiles(pr.number);
    if ((files?.length) > max_files_allowed) {
        throw new TooManyFilesError(`Critical error: Number of PR Files > ${max_files_allowed}`);
    }
};
exports.requireMaxFileNumber = requireMaxFileNumber;
//# sourceMappingURL=require_max_file_number.js.map