"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMockRecords = exports.assertSavedRecord = exports.SavedRecord = void 0;
const domain_1 = require("src/domain");
const exceptions_1 = require("src/domain/exceptions");
var SavedRecord;
(function (SavedRecord) {
    /**
     * **SHOULD FAIL**
     *
     * Summary: editor approval wasn't required if the author of the PR was an editor
     *
     * Explanation: if an editor is an author of an EIP and they submit a PR, then the
     * bot will assume that it has been approved by the editor. But this shouldn't happen.
     * The fix to this bug was considering EIP_EDITORS to be dynamic based on the eip / file
     * at hand. So if an editor is an author they won't be consider an editor for that test.
     * */
    SavedRecord["PR3596"] = "3596";
    /** **SHOULD PASS**
     *
     *  Summary: wasn't passing despite editor approval
     *
     *  Explanation: The cause of the bug was that the EIP_EDITORS list had capitals in it,
     *  so when it was checking if it was in the list it wouldn't match MicahZoltu
     *  to micahzoltu. And so it failed.
     */
    SavedRecord["PR3654_1"] = "3654_1";
    /** **SHOULD FAIL**
     *
     *  Summary: editors weren't mentioned if there was only a valid status error
     *
     *  Explanation: The cause of this bug was that despite there being a valid status error
     *  (i.e. status is Final) and that requiring editor approval the logic
     *  that actually collected the mentions didn't account for it. So I added that
     *  logic and it was golden
     */
    SavedRecord["PR3654_2"] = "3654_2";
    /**
     * **SHOULD PASS**
     *
     * @summary: [false alarm] greg opened a pull request and it automatically merged for
     *  an unknown reason. There were no editor reviews.
     *
     * @description: This was perceived as an error because greg moved the status from
     * draft to review at first but then reverted this change. In this case it was
     * expected behavior to auto merge; but it was incorrect interpreted.
     */
    SavedRecord["PR3767"] = "3767";
    /**
     * @summary: a pull request changed the status from last call to review,
     * it was caught by the linter but the editors weren't mentioned and they
     * were presumably not required
     *
     * @description:
     */
    SavedRecord["PR3676"] = "3676";
    /**
     * **SHOULD PASS**
     *
     * @summary: multi-file PR change with bot
     */
    SavedRecord["PR3612"] = "3612";
    /**
     * **SHOULD FAIL**
     *
     * @summary: multi-file PR that does not have the necessary reviews for it to pass
     */
    SavedRecord["PR4192"] = "4192";
    /**
     * **SHOULD SUCCEED**
     *
     * @summary: this is one where the bot mentioned the email of the user when
     * it couldn't find the username. Either try to
     */
    SavedRecord["PR3768_1"] = "3768_1";
    /**
     * **SHOULD FAIL**
     *
     * @summary: Same as PR3768_1 but in this case I deleted the author's review;
     * the goal is to use this PR to verify that an author with an email won't be
     * mentioned.
     */
    SavedRecord["PR3768_2"] = "3768_2";
    /**
     * **SHOULD PASS**
     *
     * @summary: PR3623 was approved by the author but it didn't merge, so this
     * was a bug where author's approval didn't actually merge anything
     */
    SavedRecord["PR3623"] = "3623";
    /**
     * @summary: this is an example PR that was used to implement the feature
     * that authors be allowed to submit a PR to mark their EIP withdrawn and
     * that should be merged automatically
     */
    SavedRecord["PR4189"] = "4189";
    /**
     * @summary: this pull request automatically merged despite the tests failing
     * it was due to the fact unhandled errors never triggered a critical failure
     */
    SavedRecord["PR4478"] = "4478";
    /**
     * @summary: a change to eip-1 that's not able to discern the authors
     */
    SavedRecord["PR4499"] = "4499";
    /**
     *
     * @summary: the bot didn't fail gracefully on an asset file because the filename
     * provided was just the file's name instead of the path; I made all of the uses
     * of requireEIPNumber use path instead
     * @description: the bot reported
     * > ## (fail) eip-3448.md
     * > - eip-3448 state was changed from draft to review
     * > - This PR requires review from one of [@micahzoltu, @lightclient, @axic]
     * > ## (fail) assets/eip-3448/MetaProxyFactory.sol
     * > - 'MetaProxyFactory.sol' must be in eip-###.md format; this error will be overwritten upon relevant editor approval
     *
     * but it should have had a graceful failure on the assets/eip-3448/MetaProxyFactory.sol
     *
     * The problem was that it was evaluating the filename (MetaProxyFactory.sol) instead
     * of the path (assets/eip-3448/MetaProxyFactory.sol) so the code had no way
     * of knowing.
     */
    SavedRecord["PR4506"] = "4506";
    /**
     * @summary: this pull request was approved by an editor but it still said that it was not
     *
     * @description:
     * The bug here was a result of the fact that github limits the number of
     * responses it can return. At the time of this pull request the max number of
     * reviews that could be returned was 30. But there were closer to 60 on the
     * pull request. So when the bot requested reviews, it got back a truncated
     * list that lacked the editor's approval. To fix this I built in a mechanism
     * to get all reviews (no matter how many) and I increased the max to 100.
     */
    SavedRecord["PR4361"] = "4361";
})(SavedRecord = exports.SavedRecord || (exports.SavedRecord = {}));
/**
 * This will error if the provided string is not a known SavedRecord
 * @param maybeSavedRecord a string corresponding to a known SavedRecord
 */
function assertSavedRecord(maybeSavedRecord) {
    const savedRecords = Object.values(SavedRecord);
    // @ts-expect-error savedRecords is actually a string[]
    if (!savedRecords.includes(maybeSavedRecord)) {
        throw new exceptions_1.CriticalError(`${maybeSavedRecord} is not a SavedRecord, the options are ${savedRecords}`);
    }
}
exports.assertSavedRecord = assertSavedRecord;
const assertMethods = (records) => {
    records.default.map((record) => record.req?.method && (0, domain_1.requireMockMethod)(record.req.method));
};
const getMockRecords = async () => {
    const PR3767 = await Promise.resolve().then(() => __importStar(require("./3767.json")));
    const PR3676 = await Promise.resolve().then(() => __importStar(require("./3676.json")));
    const PR3612 = await Promise.resolve().then(() => __importStar(require("./3612.json")));
    const PR4192 = await Promise.resolve().then(() => __importStar(require("./4192.json")));
    const PR3768_1 = await Promise.resolve().then(() => __importStar(require("./3768/1.json")));
    const PR3768_2 = await Promise.resolve().then(() => __importStar(require("./3768/2.json")));
    const PR3596 = await Promise.resolve().then(() => __importStar(require("./3596.json")));
    const PR3654_1 = await Promise.resolve().then(() => __importStar(require("./3654/1.json")));
    const PR3654_2 = await Promise.resolve().then(() => __importStar(require("./3654/2.json")));
    const PR3623 = await Promise.resolve().then(() => __importStar(require("./3623.json")));
    const PR4189 = await Promise.resolve().then(() => __importStar(require("./4189.json")));
    const PR4478 = await Promise.resolve().then(() => __importStar(require("./4478.json")));
    const PR4499 = await Promise.resolve().then(() => __importStar(require("./4499.json")));
    const PR4506 = await Promise.resolve().then(() => __importStar(require("./4506.json")));
    const PR4361 = await Promise.resolve().then(() => __importStar(require("./4361.json")));
    assertMethods(PR3767);
    assertMethods(PR3676);
    assertMethods(PR3612);
    assertMethods(PR4192);
    assertMethods(PR3768_1);
    assertMethods(PR3768_2);
    assertMethods(PR3596);
    assertMethods(PR3654_1);
    assertMethods(PR3654_2);
    assertMethods(PR3623);
    assertMethods(PR4189);
    assertMethods(PR4478);
    assertMethods(PR4506);
    assertMethods(PR4361);
    const Records = {
        PR3596: PR3596.default,
        PR3654_1: PR3654_1.default,
        PR3654_2: PR3654_2.default,
        PR3767: PR3767.default,
        PR3676: PR3676.default,
        PR3612: PR3612.default,
        PR4192: PR4192.default,
        PR3768_1: PR3768_1.default,
        PR3768_2: PR3768_2.default,
        PR3623: PR3623.default,
        PR4189: PR4189.default,
        PR4478: PR4478.default,
        PR4499: PR4499.default,
        PR4506: PR4506.default,
        PR4361: PR4361.default
    };
    return Records;
};
exports.getMockRecords = getMockRecords;
//# sourceMappingURL=index.js.map