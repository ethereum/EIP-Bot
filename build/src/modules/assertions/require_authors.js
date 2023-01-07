"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequireAuthors = void 0;
const exceptions_1 = require("src/domain/exceptions");
class RequireAuthors {
    constructor() {
        this.requireAuthors = (fileDiff) => {
            // take from base to avoid people adding themselves and being able to approve
            const authors = fileDiff.base.authors && [...fileDiff.base.authors];
            // Make sure there are authors
            if (!authors || authors.length === 0) {
                throw new exceptions_1.RequirementViolation(`${fileDiff.head.name} has no identifiable authors who can approve the PR (only considering the base version)`);
            }
            return authors;
        };
    }
}
exports.RequireAuthors = RequireAuthors;
//# sourceMappingURL=require_authors.js.map