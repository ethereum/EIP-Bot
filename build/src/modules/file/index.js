"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFileDiff = void 0;
const file_diff_infra_1 = require("#/file/modules/file_diff_infra");
const assertions_1 = require("#/assertions");
const get_parsed_content_1 = require("#/file/modules/get_parsed_content");
const _FileDiffInfra_ = new file_diff_infra_1.FileDiffInfra(assertions_1.requireFilenameEipNum, assertions_1.requirePr, get_parsed_content_1.getParsedContent);
const getFileDiff = (...args) => {
    return _FileDiffInfra_.getFileDiff(...args);
};
exports.getFileDiff = getFileDiff;
//# sourceMappingURL=index.js.map