"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = exports._main = exports._main_ = void 0;
const core_1 = require("@actions/core");
const assertions_1 = require("#/assertions");
const use_cases_1 = require("#/pull_request/use_cases");
const domain_1 = require("src/domain");
const lodash_1 = require("lodash");
const approvals_1 = require("#/approvals");
const exceptions_1 = require("src/domain/exceptions");
const utils_1 = require("#/utils");
const test_file_1 = require("#/main/modules/test_file");
const purify_test_results_1 = require("#/main/modules/purify_test_results");
const get_comment_message_1 = require("#/main/modules/get_comment_message");
const _main_ = async () => {
    const pr = await (0, assertions_1.requirePr)();
    (0, assertions_1.requireMaxFileNumber)(pr);
    // Collect the changes made in the given PR from base <-> head for eip files
    const files = await (0, assertions_1.requireFiles)(pr);
    let results = [];
    for await (const file of files) {
        try {
            const dirtyTestResults = await (0, test_file_1.testFile)(file);
            const testResults = await (0, purify_test_results_1.purifyTestResults)(dirtyTestResults);
            results.push(testResults);
        }
        catch (err) {
            (0, exceptions_1.processError)(err, {
                gracefulTermination: (message) => {
                    results.push({
                        filename: file.filename,
                        successMessage: message,
                        type: domain_1.ChangeTypes.ambiguous
                    });
                },
                requirementViolation: (message) => {
                    results.push({
                        filename: file.filename,
                        errors: [message],
                        type: domain_1.ChangeTypes.ambiguous
                    });
                },
                unexpectedError: (message, data) => {
                    console.log(JSON.stringify(data, null, 2));
                    message = `An unexpected error occurred (cc ${(0, domain_1.MAINTAINERS)().join(", ")}): ${message}`;
                    results.push({
                        filename: file.filename,
                        errors: [message],
                        type: domain_1.ChangeTypes.ambiguous
                    });
                }
            });
        }
    }
    if (!results.filter((res) => res.errors).length) {
        const commentMessage = (0, get_comment_message_1.getCommentMessage)(results, "All tests passed; auto-merging...");
        await use_cases_1.PullRequestUseCases.postComment(commentMessage);
        console.log(commentMessage);
        return;
    }
    const commentMessage = (0, get_comment_message_1.getCommentMessage)(results);
    // to avoid annoying people, it's best to only do this while running prod
    if ((0, domain_1.isProd)()) {
        await use_cases_1.PullRequestUseCases.postComment(commentMessage);
        await (0, approvals_1.requestReviewers)((0, lodash_1.uniq)(results.flatMap((res) => res.mentions).filter(Boolean)));
    }
    console.log(commentMessage);
    return (0, core_1.setFailed)(commentMessage);
};
exports._main_ = _main_;
const _main = (_main_) => async () => {
    try {
        return await _main_();
    }
    catch (error) {
        await (0, exceptions_1.processError)(error, {
            critical: async (errMessage, data) => {
                const message = (0, utils_1.multiLineString)("\n")(`A critical exception has occurred:`, `\tMessage: ${errMessage.toLowerCase()}`, data && `\tData:\n${JSON.stringify(data, null, 2)}`, (0, exceptions_1.getMaintainersString)());
                console.log(message);
                if ((0, domain_1.isProd)()) {
                    await use_cases_1.PullRequestUseCases.postComment(message);
                }
                (0, core_1.setFailed)(message);
                throw message;
            },
            unhandled: async (error) => {
                // useful for making sure that auto-mocking can function (dev tool)
                if ((0, domain_1.isNockDisallowedNetConnect)(error) ||
                    (0, domain_1.isNockNoMatchingRequest)(error)) {
                    throw error;
                }
                const message = (0, exceptions_1.getUnhandledErrorMessage)(error) + (0, exceptions_1.getMaintainersString)();
                console.log(message);
                if ((0, domain_1.isProd)()) {
                    await use_cases_1.PullRequestUseCases.postComment(message);
                }
                (0, core_1.setFailed)(message);
                throw message;
            }
        });
    }
};
exports._main = _main;
exports.main = (0, exports._main)(exports._main_);
//# sourceMappingURL=main.js.map