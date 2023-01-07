"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssertHasAuthors = void 0;
const utils_1 = require("#/utils");
class AssertHasAuthors {
    constructor() {
        this.assertHasAuthors = (file) => {
            // take from base to avoid people adding themselves and being able to approve
            const authors = file.base.authors && [...file.base.authors];
            // Make sure there are authors
            if (!authors || authors.length === 0) {
                return (0, utils_1.multiLineString)(" ")(`${file.head.name} has no identifiable authors who`, `can approve the PR (only considering the base version)`);
            }
            else
                return;
        };
    }
}
exports.AssertHasAuthors = AssertHasAuthors;
//# sourceMappingURL=assert_has_authors.js.map