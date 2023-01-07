"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testFile = void 0;
const domain_1 = require("src/domain");
const file_1 = require("#/file");
const assertions_1 = require("#/assertions");
const exceptions_1 = require("src/domain/exceptions");
const testFile = async (file) => {
    // we need to define this here because the below logic can get very complicated otherwise
    const errors = domain_1.DEFAULT_ERRORS;
    // file testing is not compatible (yet) with an initialy undefined file
    // so instead it's required here. It throws an exception for consistency
    const fileDiff = await (0, file_1.getFileDiff)(file);
    try {
        file = await (0, assertions_1.requireFilePreexisting)(file);
    }
    catch (err) {
        (0, exceptions_1.processError)(err, {
            requirementViolation: (message) => {
                errors.fileErrors.filePreexistingError = message;
            }
            // all other types will throw the exception
        });
        errors.approvalErrors.isEditorApprovedError = await (0, assertions_1.assertEIPEditorApproval)(fileDiff);
        // new files are acceptable if an editor has approved
        if (errors.approvalErrors.isEditorApprovedError) {
            return {
                errors,
                fileDiff
            };
        }
    }
    errors.approvalErrors.isEditorApprovedError = await (0, assertions_1.assertEIPEditorApproval)(fileDiff);
    errors.approvalErrors.enoughEditorApprovalsForEIP1Error =
        await (0, assertions_1.assertEIP1EditorApprovals)(fileDiff);
    errors.fileErrors.validFilenameError = await (0, assertions_1.assertValidFilename)(file);
    errors.headerErrors.matchingEIPNumError =
        (0, assertions_1.assertFilenameAndFileNumbersMatch)(fileDiff);
    errors.headerErrors.constantEIPNumError = (0, assertions_1.assertConstantEipNumber)(fileDiff);
    errors.headerErrors.constantStatusError = (0, assertions_1.assertConstantStatus)(fileDiff);
    errors.headerErrors.validStatusError = (0, assertions_1.assertValidStatus)(fileDiff);
    errors.authorErrors.hasAuthorsError = (0, assertions_1.assertHasAuthors)(fileDiff);
    // if no authors then remaining items aren't relevant to check
    if (errors.authorErrors.hasAuthorsError) {
        return {
            errors,
            fileDiff
        };
    }
    errors.approvalErrors.isAuthorApprovedError = await (0, assertions_1.assertIsApprovedByAuthors)(fileDiff);
    return {
        errors,
        fileDiff,
        authors: (0, assertions_1.requireAuthors)(fileDiff)
    };
};
exports.testFile = testFile;
//# sourceMappingURL=test_file.js.map