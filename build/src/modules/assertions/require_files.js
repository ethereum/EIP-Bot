"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireFiles = void 0;
const exceptions_1 = require("src/domain/exceptions");
const github_1 = require("src/infra/github");
/**
 * compares the diff between the base commit of the PR and
 * the head commit; if no files were found then it will explode
 *
 * @returns {File}
 */
const requireFiles = async (pr) => {
    const files = await github_1.github.getPullRequestFiles(pr.number);
    if (!files?.length) {
        throw new exceptions_1.RequirementViolation([
            "There were no files found to be associated",
            "with the PR within context"
        ].join(" "));
    }
    return files;
};
exports.requireFiles = requireFiles;
//# sourceMappingURL=require_files.js.map