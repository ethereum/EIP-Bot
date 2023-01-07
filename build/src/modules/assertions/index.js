"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertEIP1EditorApprovals = exports.assertHasAuthors = exports.assertValidFilename = exports.requireFilenameEipNum = exports.requireFilePreexisting = exports.requireEIPEditors = exports.requireAuthors = void 0;
const require_authors_1 = require("./require_authors");
const require_editors_1 = require("./require_editors");
const require_file_preexisting_1 = require("./require_file_preexisting");
const domain_1 = require("src/domain");
const require_pr_1 = require("#/assertions/require_pr");
const assert_valid_filename_1 = require("#/assertions/assert_valid_filename");
const require_filename_eip_num_1 = require("./require_filename_eip_num");
const approvals_1 = require("../approvals");
const get_parsed_content_1 = require("../file/modules/get_parsed_content");
const assert_has_authors_1 = require("#/assertions/assert_has_authors");
const assert_eip1_editor_approvals_1 = require("#/assertions/assert_eip1_editor_approvals");
const infra_1 = require("src/infra");
__exportStar(require("./require_pull_number"), exports);
__exportStar(require("./require_pr"), exports);
__exportStar(require("./assert_is_approved_by_authors"), exports);
__exportStar(require("./require_files"), exports);
__exportStar(require("./assert_filename_and_file_numbers_match"), exports);
__exportStar(require("./assert_constant_eip_number"), exports);
__exportStar(require("./assert_valid_status"), exports);
__exportStar(require("./assert_eip_editor_approval"), exports);
__exportStar(require("./assert_constant_status"), exports);
__exportStar(require("./require_max_file_number"), exports);
const _RequireAuthors = new require_authors_1.RequireAuthors();
exports.requireAuthors = (0, domain_1.castTo)((...args) => {
    // @ts-ignore
    return _RequireAuthors.requireAuthors(...args);
});
const _RequireEIPEditors = new require_editors_1.RequireEditors({
    requireAuthors: exports.requireAuthors,
    ERC_EDITORS: domain_1.ERC_EDITORS,
    CORE_EDITORS: domain_1.CORE_EDITORS,
    INFORMATIONAL_EDITORS: domain_1.INFORMATIONAL_EDITORS,
    INTERFACE_EDITORS: domain_1.INTERFACE_EDITORS,
    META_EDITORS: domain_1.META_EDITORS,
    NETWORKING_EDITORS: domain_1.NETWORKING_EDITORS
});
const requireEIPEditors = (fileDiff) => _RequireEIPEditors.requireEIPEditors(fileDiff);
exports.requireEIPEditors = requireEIPEditors;
const _RequireFilePreexisting = new require_file_preexisting_1.RequireFilePreexisting(require_pr_1.requirePr, infra_1.github.getRepoFilenameContent);
exports.requireFilePreexisting = (0, domain_1.castTo)((...args) => {
    // @ts-ignore
    return _RequireFilePreexisting.requireFilePreexisting(...args);
});
const _RequireFilenameEIPNum = new require_filename_eip_num_1.RequireFilenameEIPNum({
    getPullRequestFiles: infra_1.github.getPullRequestFiles,
    requirePr: require_pr_1.requirePr,
    requireEIPEditors: exports.requireEIPEditors,
    getApprovals: approvals_1.getApprovals,
    getParsedContent: get_parsed_content_1.getParsedContent
});
exports.requireFilenameEipNum = (0, domain_1.castTo)((...args) => {
    // @ts-ignore
    return _RequireFilenameEIPNum.requireFilenameEipNum(...args);
});
const _AssertValidFilename = new assert_valid_filename_1.AssertValidFilename({
    requireFilenameEipNum: exports.requireFilenameEipNum
});
exports.assertValidFilename = (0, domain_1.castTo)((...args) => {
    // @ts-ignore
    return _AssertValidFilename.assertValidFilename(...args);
});
const _AssertHasAuthors = new assert_has_authors_1.AssertHasAuthors();
exports.assertHasAuthors = (0, domain_1.castTo)((...args) => {
    // @ts-ignore
    return _AssertHasAuthors.assertHasAuthors(...args);
});
const _AssertEIP1EditorApprovals = new assert_eip1_editor_approvals_1.AssertEIP1EditorApprovals(approvals_1.getApprovals);
exports.assertEIP1EditorApprovals = (0, domain_1.castTo)((...args) => {
    // @ts-ignore
    return _AssertEIP1EditorApprovals.assertEIP1EditorApprovals(...args);
});
//# sourceMappingURL=index.js.map