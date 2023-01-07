"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requirePr = void 0;
const assertions_1 = require("#/assertions");
const exceptions_1 = require("src/domain/exceptions");
const infra_1 = require("src/infra");
const requirePr = async () => {
    const prNum = (0, assertions_1.requirePullNumber)();
    const pr = await infra_1.github.getPullRequestFromNumber(prNum);
    if (pr.merged && process.env.NODE_ENV !== "development") {
        throw new exceptions_1.CriticalError(`PR ${prNum} is already merged; quitting`);
    }
    return pr;
};
exports.requirePr = requirePr;
//# sourceMappingURL=require_pr.js.map