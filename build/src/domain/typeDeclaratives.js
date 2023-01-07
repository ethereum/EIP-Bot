"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.declareType = exports.assertGithubHandle = exports.isChangeType = exports.isFileNotFound = exports.castTo = exports.requireEncoding = exports.assertDefined = exports.isDefined = void 0;
const lodash_1 = __importDefault(require("lodash"));
const utils_1 = require("#/utils");
const domain_1 = require("src/domain");
const exceptions_1 = require("src/domain/exceptions");
/** includes a check for NaN and general falsey */
const isDefined = (maybeDefined) => {
    return !(0, utils_1.OR)(lodash_1.default.isUndefined(maybeDefined), lodash_1.default.isNull(maybeDefined), lodash_1.default.isNaN(maybeDefined), maybeDefined === "", (0, utils_1.AND)((0, utils_1.OR)(lodash_1.default.isObject(maybeDefined), lodash_1.default.isArray(maybeDefined)), lodash_1.default.isEmpty(maybeDefined)));
};
exports.isDefined = isDefined;
function assertDefined(maybeDefined) {
    if ((0, utils_1.OR)(lodash_1.default.isUndefined(maybeDefined), lodash_1.default.isNull(maybeDefined))) {
        throw new exceptions_1.RequirementViolation("A defined assertion was violated");
    }
}
exports.assertDefined = assertDefined;
/** Ensures that encodings are as expected by octokit */
function requireEncoding(maybeEncoding, context) {
    // any here because of https://github.com/microsoft/TypeScript/issues/26255
    if (!domain_1.encodings.includes(maybeEncoding))
        throw new exceptions_1.UnexpectedError(`Unknown encoding of ${context}: ${maybeEncoding}`);
}
exports.requireEncoding = requireEncoding;
function castTo(value) {
    return value;
}
exports.castTo = castTo;
const isFileNotFound = (err) => {
    return (0, utils_1.AND)(err.response?.status === 404, err.response?.data?.message === "Not Found");
};
exports.isFileNotFound = isFileNotFound;
const isChangeType = (str) => {
    return Object.values(domain_1.ChangeTypes).includes(str);
};
exports.isChangeType = isChangeType;
function assertGithubHandle(maybeHandle) {
    if (!domain_1.GITHUB_HANDLE.test(maybeHandle)) {
        throw new exceptions_1.CriticalError(`${maybeHandle} is not a correctly formatted github handle`);
    }
}
exports.assertGithubHandle = assertGithubHandle;
function declareType(input) { }
exports.declareType = declareType;
//# sourceMappingURL=typeDeclaratives.js.map