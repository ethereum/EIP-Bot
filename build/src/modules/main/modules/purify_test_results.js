"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.purifyTestResults = void 0;
const purifiers_1 = require("#/purifiers");
const utils_1 = require("#/utils");
const lodash_1 = require("lodash");
const get_type_1 = require("./get_type");
const purifyTestResults = async (dirtyTestResults) => {
    // Apply independent purifiers
    const primedPurifiers = [
        (0, purifiers_1.statusChangeAllowedPurifier)(dirtyTestResults),
        (0, purifiers_1.editorApprovalPurifier)(dirtyTestResults),
        (0, purifiers_1.EIP1Purifier)(dirtyTestResults),
        (0, purifiers_1.withdrawnExceptionPurifier)(dirtyTestResults)
    ];
    // Purify the dirty results
    const testResults = (0, utils_1.innerJoinAncestors)(dirtyTestResults, primedPurifiers);
    const errors = (0, utils_1.getAllTruthyObjectPaths)(testResults.errors).map((path) => (0, lodash_1.get)(testResults.errors, path));
    const type = (0, get_type_1.getType)(testResults);
    if (errors.length === 0) {
        console.log(`${testResults.fileDiff.base.name} passed!`);
        return {
            filename: testResults.fileDiff.base.name,
            type
        };
    }
    return {
        filename: testResults.fileDiff.base.name,
        errors,
        type
    };
};
exports.purifyTestResults = purifyTestResults;
//# sourceMappingURL=purify_test_results.js.map