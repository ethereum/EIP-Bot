"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.matchAll = exports.FILE_IN_EIP_FOLDER = exports.ASSETS_EIP_NUM = exports.GITHUB_HANDLE = exports.EIP_NUM_RE = exports.AUTHOR_RE = exports.FILE_RE = void 0;
/** matches correctly formatted filenames */
exports.FILE_RE = /^EIPS\/eip-(\d+)\.md$/gm;
/** matches authors names formated like (...) */
exports.AUTHOR_RE = /[(<]([^>)]+)[>)]/gm;
/** to find the EIP number in a file name */
exports.EIP_NUM_RE = /eip-(\d+)\.md/;
/** matches github handles (includes @)*/
exports.GITHUB_HANDLE = /^@[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;
/** extracts the eip number of the assets folder associated */
exports.ASSETS_EIP_NUM = /(?<=^assets\/eip-)(\d+)(?=\/.*)/;
/** this is used to test if a new file should be considered allowed */
exports.FILE_IN_EIP_FOLDER = /^EIPS\/eip-[a-zA-Z]*_.*\.md/;
/**
 * This functionality is supported in es2020, but for the purposes
 * of compatibility (and because it's quite simple) it's built explicitly
 */
const matchAll = (rawString, regex, group) => {
    let match = regex.exec(rawString);
    let matches = [];
    while (match != null) {
        const matchedGroup = match[group];
        if (matchedGroup === undefined)
            continue;
        matches.push(matchedGroup);
        match = regex.exec(rawString);
    }
    return matches;
};
exports.matchAll = matchAll;
//# sourceMappingURL=Regex.js.map