import { ASSETS_EIP_NUM, EIP_NUM_RE, File, FileDiff, PR } from "src/domain";
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

  constructor({
    getPullRequestFiles,
    requirePr,
    requireEIPEditors,
    getApprovals
  }: {
    getPullRequestFiles: (pullNumber: number) => Promise<File[]>;
    requirePr: () => Promise<PR>;
    requireEIPEditors: (fileDiff?: FileDiff | undefined) => string[];
    getApprovals: () => Promise<string[]>;
  }) {
    this.getPullRequestFiles = getPullRequestFiles;
    this.requirePr = requirePr;
    this.requireEIPEditors = requireEIPEditors;
    this.getApprovals = getApprovals;
  }

  public attemptAssetGracefulTermination = async (filename: string) => {
    if (!ASSETS_EIP_NUM.test(filename)) {
      return;
    }

    const assetEipNumMatch = filename.match(ASSETS_EIP_NUM);
    if (!assetEipNumMatch || assetEipNumMatch[1] === undefined) {
      throw new UnexpectedError(
        multiLineString(" ")(
          `The filename '${filename}' is seen to match an asset file but`,
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
      if (otherFilename === filename) {
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
            `file ${filename} is associated with EIP ${assetEipNum}; because`,
            `there are also changes being made to ${otherFilename} all changes`,
            `to corresponding assets are also allowed`
          )
        );
      }
    }
    throw new RequirementViolation(
      multiLineString(" ")(
        `file ${filename} is associated with EIP ${assetEipNum} but there`,
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
      _.intersection(editorApprovals, approvals).length !== 0;
    if (isEditorApproved) {
      throw new GracefulTermination(
        multiLineString(" ")(
          `file ${filename} is not a valid filename, but this error has been`,
          `ignored due to editor approvals`
        )
      );
    }
  };

  /**
   * Extracts the EIP number from a given filename (or returns null)
   * @param filename EIP filename
   */
  requireFilenameEipNum = async (filename: string) => {
    const eipNumMatch = filename.match(EIP_NUM_RE);
    if (!eipNumMatch || eipNumMatch[1] === undefined) {
      await this.attemptAssetGracefulTermination(filename);
      await this.attemptEditorApprovalGracefulTermination(filename);
      throw new RequirementViolation(
        `'${filename}' must be in eip-###.md format; this error will be overwritten upon relevant editor approval`
      );
    }
    return eipNumMatch && parseInt(eipNumMatch[1]);
  };
}
