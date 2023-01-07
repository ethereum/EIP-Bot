"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALLOWED_STATUSES = exports.isNockDisallowedNetConnect = exports.isNockNoMatchingRequest = exports.isDevelopment = exports.isProd = exports.isMock = exports.isTest = exports.EIP1_REQUIRED_EDITOR_APPROVALS = exports.CHECK_STATUS_INTERVAL = exports.DEFAULT_ERRORS = exports.ChangeTypes = exports.EVENTS = exports.FileStatus = exports.EipStatus = exports.assertCategory = exports.assertIsTypeEnum = exports.assertIsCategoryEnum = exports.EIPTypeOrCategoryToResolver = exports.EIPTypes = exports.EIPCategory = exports.FrontMatterAttributes = exports.MAINTAINERS = exports.INFORMATIONAL_EDITORS = exports.META_EDITORS = exports.INTERFACE_EDITORS = exports.NETWORKING_EDITORS = exports.ERC_EDITORS = exports.CORE_EDITORS = exports.assertMaintainersFormat = exports.assertEditorsFormat = exports.GITHUB_TOKEN = exports.COMMENT_HEADER = exports.MERGE_MESSAGE = exports.PUBLIC_GITHUB_KEY = void 0;
const Types_1 = require("./Types");
const utils_1 = require("#/utils");
const exceptions_1 = require("src/domain/exceptions");
const typeDeclaratives_1 = require("./typeDeclaratives");
const lodash_1 = __importDefault(require("lodash"));
// this is meant to be a public key associated with a orphaned account;
// it is encoded / decoded here because github will invalidate it if it knows
// that its public (so shhh); also this key will never expire
exports.PUBLIC_GITHUB_KEY = Buffer.from("Z2hwX1hvVVBlcFpTUkdWWmFVdDRqOW44SHFSUloxNVlIZTFlNW82bw==", "base64").toString("ascii");
exports.MERGE_MESSAGE = `
    Hi, I'm a bot! This change was automatically merged because:
    - It only modifies existing Draft, Review, or Last Call EIP(s)
    - The PR was approved or written by at least one author of each modified EIP
    - The build is passing
    `;
exports.COMMENT_HEADER = "Hi! I'm a bot, and I wanted to automerge your PR, but couldn't because of the following issue(s):\n\n";
exports.GITHUB_TOKEN = process.env.GITHUB_TOKEN || exports.PUBLIC_GITHUB_KEY;
const handleStringToArray = (str) => str && str.split(",").map((str) => str.trim());
function assertEditorsFormat(maybeEditors) {
    if (!maybeEditors || !maybeEditors.length) {
        console.log([
            `at least one editor must be provided, you provided these environment variables`,
            `\tERC_EDITORS: ${process.env.ERC_EDITORS}`,
            `\tCORE_EDITORS: ${process.env.CORE_EDITORS}`,
            `these were then parsed to become`,
            `\tERC_EDITORS: ${JSON.stringify(handleStringToArray(process.env.ERC_EDITORS))}`,
            `\tCORE_EDITORS: ${JSON.stringify(handleStringToArray(process.env.CORE_EDITORS))}`
        ].join("\n"));
        throw new exceptions_1.CriticalError("at least one editor must be provided");
    }
    for (const maybeEditor of maybeEditors) {
        (0, typeDeclaratives_1.assertGithubHandle)(maybeEditor);
    }
}
exports.assertEditorsFormat = assertEditorsFormat;
function assertMaintainersFormat(maybeMaintainers) {
    if (lodash_1.default.isNil(maybeMaintainers) || lodash_1.default.isEmpty(maybeMaintainers)) {
        console.log(`MAINTAINERS: ${process.env.MAINTAINERS}`);
        throw new exceptions_1.CriticalError("at least one maintainer must be provided");
    }
    for (const maybeMaintainer of maybeMaintainers) {
        (0, typeDeclaratives_1.assertGithubHandle)(maybeMaintainer);
    }
}
exports.assertMaintainersFormat = assertMaintainersFormat;
const getEditors = (envEditors) => {
    const editors = handleStringToArray(envEditors);
    assertEditorsFormat(editors);
    return editors;
};
const getMaintainers = (envMaintainers) => {
    const maintainers = handleStringToArray(envMaintainers);
    assertMaintainersFormat(maintainers);
    return maintainers;
};
/** don't use this directly, use `requireCoreEditors` instead */
const CORE_EDITORS = () => getEditors(process.env.CORE_EDITORS);
exports.CORE_EDITORS = CORE_EDITORS;
/** don't use this directly, use `requireERCEditors` instead */
const ERC_EDITORS = () => getEditors(process.env.ERC_EDITORS);
exports.ERC_EDITORS = ERC_EDITORS;
/** don't use this directly, use `requireERCEditors` instead */
const NETWORKING_EDITORS = () => getEditors(process.env.NETWORKING_EDITORS);
exports.NETWORKING_EDITORS = NETWORKING_EDITORS;
/** don't use this directly, use `requireERCEditors` instead */
const INTERFACE_EDITORS = () => getEditors(process.env.INTERFACE_EDITORS);
exports.INTERFACE_EDITORS = INTERFACE_EDITORS;
/** don't use this directly, use `requireERCEditors` instead */
const META_EDITORS = () => getEditors(process.env.META_EDITORS);
exports.META_EDITORS = META_EDITORS;
/** don't use this directly, use `requireERCEditors` instead */
const INFORMATIONAL_EDITORS = () => getEditors(process.env.INFORMATIONAL_EDITORS);
exports.INFORMATIONAL_EDITORS = INFORMATIONAL_EDITORS;
/**
 * dont' use this directly, it can explode and break error handling,
 * so use `getMaintainersString` instead where relevant
 * */
const MAINTAINERS = () => {
    return getMaintainers(process.env.MAINTAINERS);
};
exports.MAINTAINERS = MAINTAINERS;
var FrontMatterAttributes;
(function (FrontMatterAttributes) {
    FrontMatterAttributes["status"] = "status";
    FrontMatterAttributes["eip"] = "eip";
    FrontMatterAttributes["author"] = "author";
    FrontMatterAttributes["category"] = "category";
    FrontMatterAttributes["type"] = "type";
})(FrontMatterAttributes = exports.FrontMatterAttributes || (exports.FrontMatterAttributes = {}));
var EIPCategory;
(function (EIPCategory) {
    EIPCategory["erc"] = "erc";
    EIPCategory["core"] = "core";
    EIPCategory["networking"] = "networking";
    EIPCategory["interface"] = "interface";
})(EIPCategory = exports.EIPCategory || (exports.EIPCategory = {}));
var EIPTypes;
(function (EIPTypes) {
    EIPTypes["informational"] = "informational";
    EIPTypes["meta"] = "meta";
    EIPTypes["standardsTrack"] = "standards track";
})(EIPTypes = exports.EIPTypes || (exports.EIPTypes = {}));
exports.EIPTypeOrCategoryToResolver = {
    [EIPCategory.erc]: "ERC_EDITORS",
    [EIPCategory.core]: "CORE_EDITORS",
    [EIPCategory.interface]: "INTERFACE_EDITORS",
    [EIPCategory.networking]: "NETWORKING_EDITORS",
    [EIPTypes.meta]: "META_EDITORS",
    [EIPTypes.informational]: "INFORMATIONAL_EDITORS"
};
/** asserts a string's type is within EIPCategory */
function assertIsCategoryEnum(maybeCategory, fileName) {
    const categories = Object.values(EIPCategory);
    if (!categories.includes(maybeCategory)) {
        throw new exceptions_1.RequirementViolation([
            `the provided eip category '${maybeCategory}' of file`,
            `'${fileName}' is required to be one of (${categories.join(", ")})`
        ].join(" "));
    }
}
exports.assertIsCategoryEnum = assertIsCategoryEnum;
function assertIsTypeEnum(maybeType, fileName) {
    const types = Object.values(EIPTypes);
    if (!types.includes(maybeType)) {
        throw new exceptions_1.RequirementViolation([
            `the provided eip type is '${maybeType}' of file`,
            `'${fileName}' is required to be one of (${types.join(", ")})`
        ].join(" "));
    }
}
exports.assertIsTypeEnum = assertIsTypeEnum;
const assertCategory = ({ fileName, maybeCategory, maybeType }) => {
    if (!maybeType) {
        throw new exceptions_1.RequirementViolation(`A 'type' header is required for all EIPs, '${fileName}' does not have a 'type'`);
    }
    const normalizedType = maybeType.toLowerCase();
    assertIsTypeEnum(normalizedType, fileName);
    if (normalizedType === EIPTypes.informational) {
        return {
            category: null,
            type: EIPTypes.informational
        };
    }
    if (normalizedType === EIPTypes.meta) {
        return {
            category: null,
            type: EIPTypes.meta
        };
    }
    if (normalizedType === EIPTypes.standardsTrack) {
        const normalized = maybeCategory?.toLowerCase();
        if (!normalized) {
            throw new exceptions_1.RequirementViolation([
                `'${fileName}' does not have a 'category' property, but it MUST`,
                `be set for eips that are type ${EIPTypes.standardsTrack}`
            ].join(" "));
        }
        assertIsCategoryEnum(normalized, fileName);
        return {
            category: normalized,
            type: EIPTypes.standardsTrack
        };
    }
    throw new exceptions_1.UnexpectedError("type was not a known type, this error should never occur");
};
exports.assertCategory = assertCategory;
var EipStatus;
(function (EipStatus) {
    EipStatus["draft"] = "draft";
    EipStatus["withdrawn"] = "withdrawn";
    EipStatus["lastCall"] = "last call";
    EipStatus["review"] = "review";
    EipStatus["final"] = "final";
    EipStatus["living"] = "living";
})(EipStatus = exports.EipStatus || (exports.EipStatus = {}));
var FileStatus;
(function (FileStatus) {
    FileStatus["added"] = "added";
})(FileStatus = exports.FileStatus || (exports.FileStatus = {}));
var EVENTS;
(function (EVENTS) {
    EVENTS["pullRequest"] = "pull_request";
    EVENTS["pullRequestTarget"] = "pull_request_target";
    EVENTS["pullRequestReview"] = "pull_request_review";
})(EVENTS = exports.EVENTS || (exports.EVENTS = {}));
var ChangeTypes;
(function (ChangeTypes) {
    ChangeTypes["newEIPFile"] = "newEIPFile";
    ChangeTypes["statusChange"] = "statusChange";
    ChangeTypes["updateEIP"] = "updateEIP";
    ChangeTypes["ambiguous"] = "ambiguous";
})(ChangeTypes = exports.ChangeTypes || (exports.ChangeTypes = {}));
/**
 *  A collection of error strings, although confusing the error strings are
 *  define if an error exists and undefined if not; i.e.
 *  `ERRORS.approvalErrors.isAuthorApproved` is truthy if authors have NOT
 *  approved the PR and falsey if they have because in the case that they
 *  have approved the PR no error exists
 */
exports.DEFAULT_ERRORS = {
    fileErrors: {},
    headerErrors: {},
    authorErrors: {},
    approvalErrors: {}
};
exports.CHECK_STATUS_INTERVAL = 30000;
exports.EIP1_REQUIRED_EDITOR_APPROVALS = 5;
const isTest = () => {
    return process.env.NODE_ENV === Types_1.NodeEnvs.test;
};
exports.isTest = isTest;
const isMock = () => {
    return process.env.NODE_ENV === Types_1.NodeEnvs.mock;
};
exports.isMock = isMock;
const isProd = () => {
    return process.env.NODE_ENV === Types_1.NodeEnvs.production;
};
exports.isProd = isProd;
const isDevelopment = () => {
    return process.env.NODE_ENV === Types_1.NodeEnvs.developemnt;
};
exports.isDevelopment = isDevelopment;
const isNockNoMatchingRequest = (err) => {
    if ((0, exports.isMock)()) {
        const message = err.message?.toLowerCase();
        if (!message)
            return false;
        return (0, utils_1.AND)(/nock/.test(message), /method/.test(message), /url/.test(message), /no match/.test(message));
    }
    return false;
};
exports.isNockNoMatchingRequest = isNockNoMatchingRequest;
const isNockDisallowedNetConnect = (err) => {
    if ((0, exports.isMock)()) {
        const message = err.message?.toLowerCase();
        if (!message)
            return false;
        return (0, utils_1.AND)(/nock/.test(message), /disallowed/.test(message), /request.*failed/.test(message), /net connect/.test(message));
    }
    return false;
};
exports.isNockDisallowedNetConnect = isNockDisallowedNetConnect;
exports.ALLOWED_STATUSES = new Set([
    EipStatus.draft,
    EipStatus.lastCall,
    EipStatus.review
]);
//# sourceMappingURL=Constants.js.map