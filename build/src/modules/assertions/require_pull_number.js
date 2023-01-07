"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requirePullNumber = void 0;
const exceptions_1 = require("src/domain/exceptions");
const infra_1 = require("src/infra");
const requirePullNumber = () => {
    const pullNumber = infra_1.github.getPullNumber();
    if (!pullNumber) {
        throw new exceptions_1.CriticalError("Build does not have a PR number associated with it; quitting...");
    }
    return pullNumber;
};
exports.requirePullNumber = requirePullNumber;
//# sourceMappingURL=require_pull_number.js.map