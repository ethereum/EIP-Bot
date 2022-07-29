import {
  ASSETS_EIP_NUM,
  EIP_NUM_RE,
  File,
  FILE_IN_EIP_FOLDER,
  FileDiff,
  isFileNotFound,
  ParsedContent,
  PR
} from "src/domain";
import {
  GracefulTermination,
  RequirementViolation,
  UnexpectedError
} from "src/domain/exceptions";
import { IRequireFilenameEIPNum } from "#/assertions/Domain/types";
import { multiLineString } from "../utils";
import _ from "lodash";

export class RequireFilenameEIPNum implements IRequireFilenameEIPNum {
  public getPullRequestFiles: (pullNumber: number) => Promise<File[]>;
  public requirePr: () => Promise<PR>;
  public requireEIPEditors: (fileDiff?: FileDiff | undefined) => string[];
  public getApprovals: () => Promise<string[]>;
  public getParsedContent: (
    filename: string,
    sha: string
  ) => Promise<ParsedContent>;

  constructor({
    getPullRequestFiles,
    requirePr,
    requireEIPEditors,
    getApprovals,
    getParsedContent
  }: {
    getPullRequestFiles: (pullNumber: number) => Promise<File[]>;
    requirePr: () => Promise<PR>;
    requireEIPEditors: (fileDiff?: FileDiff | undefined) => string[];
    getApprovals: () => Promise<string[]>;
    getParsedContent: (filename: string, sha: string) => Promise<ParsedContent>;
  }) {
    this.getPullRequestFiles = getPullRequestFiles;
    this.requirePr = requirePr;
    this.requireEIPEditors = requireEIPEditors;
    this.getApprovals = getApprovals;
    this.getParsedContent = getParsedContent;
  }

  public attemptAssetGracefulTermination = async (path: string) => {
    if (!ASSETS_EIP_NUM.test(path)) {
      return;
    }

    const assetEipNumMatch = path.match(ASSETS_EIP_NUM);
    if (!assetEipNumMatch || assetEipNumMatch[1] === undefined) {
      throw new UnexpectedError(
        multiLineString(" ")(
          `The filename '${path}' is seen to match an asset file but`,
          `the extracted eip number is undefined`
        )
      );
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
      const eipNumMatch = otherFilename.match(EIP_NUM_RE);
      if (!eipNumMatch || eipNumMatch[1] === undefined) {
        continue;
      }

      const eipNum = parseInt(eipNumMatch[1]);
      if (eipNum === assetEipNum) {
        throw new GracefulTermination(
          multiLineString(" ")(
            `file ${path} is associated with EIP ${assetEipNum}; because`,
            `there are also changes being made to ${otherFilename} all changes`,
            `to corresponding assets are also allowed`
          )
        );
      }
    }
    throw new RequirementViolation(
      multiLineString(" ")(
        `file ${path} is associated with EIP ${assetEipNum} but there`,
        `are no changes being made to corresponding EIP itself. To assure`,
        `that the change is authorized by the relevant stake-holders, you must`,
        `also make changes to the EIP file itself for the asset changes to`,
        `be eligible for auto-merge`
      )
    );
  };

  public attemptEditorApprovalGracefulTermination = async (
    filename: string
  ) => {
    const editorApprovals = this.requireEIPEditors();
    const approvals = await this.getApprovals();

    const isEditorApproved =
      _.intersection(editorApprovals, approvals).length >= 2;
    if (isEditorApproved) {
      throw new GracefulTermination(
        multiLineString(" ")(
          `file ${filename} is not a valid filename, but this error has been`,
          `ignored due to editor approvals`
        )
      );
    }
  };

  attemptNewFileNoEIPNumber = async (path?: string) => {
    if (!path) return;
    const PR = await this.requirePr();

    let isNewFile = await this.getParsedContent(path, PR.base.sha)
      .then((res) => false)
      .catch((err) => {
        if (isFileNotFound(err)) {
          return true;
        }
        throw err;
      });

    // if it's not a new file then the edgecase doesn't apply
    if (!isNewFile) {
      return;
    }

    const hasEIPNumber = EIP_NUM_RE.test(path);
    // this edgecase is only relevant if the filename is not in expected format
    if (hasEIPNumber) {
      return;
    }

    // this only applies to files in the eips folder
    const isInEIPSFolder = FILE_IN_EIP_FOLDER.test(path);
    if (!isInEIPSFolder) {
      return;
    }

    const editors = this.requireEIPEditors();

    throw new RequirementViolation(
      multiLineString(" ")(
        `file '${path}' is not a valid eip file name;`,
        `all eip files need to be in eip-####.md format. It's assumed`,
        `however that this has been included because an eip number`,
        `has not been provided for this eip yet. cc ${editors.join(",")}`
      )
    );
  };

  /**
   * Extracts the EIP number from a given filename (or returns null)
   * @param filename EIP filename
   */
  requireFilenameEipNum = async (path: string) => {
    const eipNumMatch = path.match(EIP_NUM_RE);
    if (!eipNumMatch || eipNumMatch[1] === undefined) {
      await this.attemptAssetGracefulTermination(path);
      await this.attemptEditorApprovalGracefulTermination(path);
      await this.attemptNewFileNoEIPNumber(path);
      throw new RequirementViolation(
        `'${path}' must be in eip-###.md format; this error will be overwritten upon relevant editor approval`
      );
    }
    return eipNumMatch && parseInt(eipNumMatch[1]);
  };
}
