"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequireEditors = void 0;
const domain_1 = require("src/domain");
const lodash_1 = __importDefault(require("lodash"));
const exceptions_1 = require("src/domain/exceptions");
class RequireEditors {
    constructor({ requireAuthors, ERC_EDITORS, CORE_EDITORS, INFORMATIONAL_EDITORS, INTERFACE_EDITORS, META_EDITORS, NETWORKING_EDITORS }) {
        this.requireAuthors = requireAuthors;
        this.ERC_EDITORS = ERC_EDITORS;
        this.CORE_EDITORS = CORE_EDITORS;
        this.INFORMATIONAL_EDITORS = INFORMATIONAL_EDITORS;
        this.INTERFACE_EDITORS = INTERFACE_EDITORS;
        this.META_EDITORS = META_EDITORS;
        this.NETWORKING_EDITORS = NETWORKING_EDITORS;
    }
    // injected to make testing easier
    _requireEIPEditors(EDITORS, fileDiff) {
        EDITORS = lodash_1.default.uniq(EDITORS.map((i) => i.toLowerCase()));
        if (fileDiff) {
            const authors = this.requireAuthors(fileDiff);
            return EDITORS.filter((editor) => !authors.includes(editor));
        }
        else {
            console.warn([
                "You are requesting all of the EIP_EDITORS, but an edgecase may exist where",
                "an editor is also an author; it's recommended that you instead request the",
                "editors with respect to a fileDiff"
            ].join(" "));
            return EDITORS;
        }
    }
    requireEIPEditors(fileDiff) {
        const { ERC_EDITORS, CORE_EDITORS, INFORMATIONAL_EDITORS, INTERFACE_EDITORS, META_EDITORS, NETWORKING_EDITORS } = this;
        if (!fileDiff || fileDiff.base.status === domain_1.EipStatus.living) {
            // if no fileDiff is provided (meaning it's a new file) then return all editors
            return this._requireEIPEditors(lodash_1.default.concat(ERC_EDITORS(), CORE_EDITORS(), NETWORKING_EDITORS(), INTERFACE_EDITORS(), META_EDITORS(), INFORMATIONAL_EDITORS()));
        }
        const isERC = fileDiff.base.category === domain_1.EIPCategory.erc;
        const isCore = fileDiff.base.category === domain_1.EIPCategory.core;
        const isNetworking = fileDiff.base.category === domain_1.EIPCategory.networking;
        const isInterface = fileDiff.base.category === domain_1.EIPCategory.interface;
        const isMeta = fileDiff.base.type === domain_1.EIPTypes.meta;
        const isInformational = fileDiff.base.type === domain_1.EIPTypes.informational;
        if (isERC) {
            return this._requireEIPEditors(ERC_EDITORS(), fileDiff);
        }
        if (isCore) {
            return this._requireEIPEditors(CORE_EDITORS(), fileDiff);
        }
        if (isNetworking) {
            return this._requireEIPEditors(NETWORKING_EDITORS(), fileDiff);
        }
        if (isInterface) {
            return this._requireEIPEditors(INTERFACE_EDITORS(), fileDiff);
        }
        // these types need to be below category to prevent mismatching categories
        if (isMeta) {
            return this._requireEIPEditors(META_EDITORS(), fileDiff);
        }
        if (isInformational) {
            return this._requireEIPEditors(INFORMATIONAL_EDITORS(), fileDiff);
        }
        throw new exceptions_1.RequirementViolation([
            `the fileDiff for '${fileDiff?.base.name}' with category '${fileDiff?.base.category}'`,
            `was neither seen to be a core or erc eip while fetching the editors. This should`,
            `never happen`
        ].join(" "));
    }
}
exports.RequireEditors = RequireEditors;
//# sourceMappingURL=require_editors.js.map