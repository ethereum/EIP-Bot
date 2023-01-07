"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getParsedContent = void 0;
const domain_1 = require("src/domain");
const exceptions_1 = require("src/domain/exceptions");
const front_matter_1 = __importDefault(require("front-matter"));
const github_1 = require("src/infra/github");
const getParsedContent = async (filename, sha) => {
    const decodeData = (data) => {
        const encoding = data.encoding;
        (0, domain_1.requireEncoding)(encoding, filename);
        return Buffer.from(data.content, encoding).toString();
    };
    // Collect the file contents at the given sha reference frame
    const data = await github_1.github
        .getRepoFilenameContent(filename, sha)
        .then((res) => res);
    // Assert type assumptions
    if (!data?.path) {
        throw new exceptions_1.UnexpectedError(`requested file ${filename} at ref sha ${sha} has no path`);
    }
    if (!data?.name) {
        throw new exceptions_1.UnexpectedError(`requested file ${filename} at ref sha ${sha} has no name`);
    }
    if (!data?.content) {
        console.warn(`requested file ${filename} at ref sha ${sha} contains no content`);
        return {
            path: data.path,
            name: data.name,
            content: (0, front_matter_1.default)('')
        };
    }
    // Return parsed information
    return {
        path: data.path,
        name: data.name,
        content: (0, front_matter_1.default)(decodeData(data))
    };
};
exports.getParsedContent = getParsedContent;
//# sourceMappingURL=get_parsed_content.js.map