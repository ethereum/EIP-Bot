"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequireFilenameEIPNum = void 0;
const domain_1 = require("src/domain");
const exceptions_1 = require("src/domain/exceptions");
const utils_1 = require("../utils");
const lodash_1 = __importDefault(require("lodash"));
class RequireFilenameEIPNum {
    constructor({ getPullRequestFiles, requirePr, requireEIPEditors, getApprovals, getParsedContent }) {
        this.attemptAssetGracefulTermination = async (path) => {
            if (!domain_1.ASSETS_EIP_NUM.test(path)) {
                return;
            }
            const assetEipNumMatch = path.match(domain_1.ASSETS_EIP_NUM);
            if (!assetEipNumMatch || assetEipNumMatch[1] === undefined) {
                throw new exceptions_1.UnexpectedError((0, utils_1.multiLineString)(" ")(`The filename '${path}' is seen to match an asset file but`, `the extracted eip number is undefined`));
            }
            const assetEipNum = parseInt(assetEipNumMatch[1]);
            const pr = await this.requirePr();
            const files = await this.getPullRequestFiles(pr.number);
            const filenames = files.map((file) => file.filename);
            for (const otherFilename of filenames) {
                // if other filename is same as current one then skip
                if (otherFilename === path) {
                    continue;
                }
                // if the filename doesn't match to an eip number skip
                const eipNumMatch = otherFilename.match(domain_1.EIP_NUM_RE);
                if (!eipNumMatch || eipNumMatch[1] === undefined) {
                    continue;
                }
                const eipNum = parseInt(eipNumMatch[1]);
                if (eipNum === assetEipNum) {
                    throw new exceptions_1.GracefulTermination((0, utils_1.multiLineString)(" ")(`file ${path} is associated with EIP ${assetEipNum}; because`, `there are also changes being made to ${otherFilename} all changes`, `to corresponding assets are also allowed`));
                }
            }
            throw new exceptions_1.RequirementViolation((0, utils_1.multiLineString)(" ")(`file ${path} is associated with EIP ${assetEipNum} but there`, `are no changes being made to corresponding EIP itself. To assure`, `that the change is authorized by the relevant stake-holders, you must`, `also make changes to the EIP file itself for the asset changes to`, `be eligible for auto-merge`));
        };
        this.attemptEditorApprovalGracefulTermination = async (filename) => {
            const editorApprovals = this.requireEIPEditors();
            const approvals = await this.getApprovals();
            const isEditorApproved = lodash_1.default.intersection(editorApprovals, approvals).length >= 2;
            if (isEditorApproved) {
                throw new exceptions_1.GracefulTermination((0, utils_1.multiLineString)(" ")(`file ${filename} is not a valid filename, but this error has been`, `ignored due to editor approvals`));
            }
        };
        this.attemptNewFileNoEIPNumber = async (path) => {
            if (!path)
                return;
            const PR = await this.requirePr();
            let isNewFile = await this.getParsedContent(path, PR.base.sha)
                .then((res) => false)
                .catch((err) => {
                if ((0, domain_1.isFileNotFound)(err)) {
                    return true;
                }
                throw err;
            });
            // if it's not a new file then the edgecase doesn't apply
            if (!isNewFile) {
                return;
            }
            const hasEIPNumber = domain_1.EIP_NUM_RE.test(path);
            // this edgecase is only relevant if the filename is not in expected format
            if (hasEIPNumber) {
                return;
            }
            // this only applies to files in the eips folder
            const isInEIPSFolder = domain_1.FILE_IN_EIP_FOLDER.test(path);
            if (!isInEIPSFolder) {
                return;
            }
            const editors = this.requireEIPEditors();
            throw new exceptions_1.RequirementViolation((0, utils_1.multiLineString)(" ")(`file '${path}' is not a valid eip file name;`, `all eip files need to be in eip-####.md format. It's assumed`, `however that this has been included because an eip number`, `has not been provided for this eip yet. cc ${editors.join(",")}`));
        };
        /**
         * Extracts the EIP number from a given filename (or returns null)
         * @param filename EIP filename
         */
        this.requireFilenameEipNum = async (path) => {
            const eipNumMatch = path.match(domain_1.EIP_NUM_RE);
            if (!eipNumMatch || eipNumMatch[1] === undefined) {
                await this.attemptAssetGracefulTermination(path);
                await this.attemptEditorApprovalGracefulTermination(path);
                await this.attemptNewFileNoEIPNumber(path);
                throw new exceptions_1.RequirementViolation(`'${path}' must be in eip-###.md format; this error will be overwritten upon relevant editor approval`);
            }
            return eipNumMatch && parseInt(eipNumMatch[1]);
        };
        this.getPullRequestFiles = getPullRequestFiles;
        this.requirePr = requirePr;
        this.requireEIPEditors = requireEIPEditors;
        this.getApprovals = getApprovals;
        this.getParsedContent = getParsedContent;
    }
}
exports.RequireFilenameEIPNum = RequireFilenameEIPNum;
//# sourceMappingURL=require_filename_eip_num.js.map