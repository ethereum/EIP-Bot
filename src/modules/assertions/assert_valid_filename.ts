import { File, FILE_RE } from "src/domain";
import { IAssertValidFilename } from "#/assertions/Domain/types";
import { multiLineString } from "#/utils";

export class AssertValidFilename implements IAssertValidFilename {
  requireFilenameEipNum: (filename: string, path: string) => Promise<number>;

  constructor({
    requireFilenameEipNum
  }: {
    requireFilenameEipNum: (filename: string, path: string) => Promise<number>;
  }) {
    this.requireFilenameEipNum = requireFilenameEipNum;
  }

  /**
   * Accepts a file and returns whether or not its name is valid
   *
   * @param errors a list to add any errors that occur to
   * @returns {boolean} is the provided file's filename valid?
   */
  assertValidFilename = async (file: NonNullable<File>) => {
    const filename = file.filename;

    // File name is formatted correctly and is in the EIPS folder
    const match = filename.search(FILE_RE);
    if (match === -1) {
      return multiLineString(" ")(
        `Filename ${filename} is not in EIP format 'EIPS/eip-####.md';`,
        `if this is a new submission (and prior to eip # being given) then`,
        `format your file like so 'eip-draft_{summary of eip}.md (don't`,
        `include the braces)`
      );
    }

    // EIP number is defined within the filename and can be parsed
    // filename is actually path when fetching directly
    const filenameEipNum = await this.requireFilenameEipNum(filename, filename);
    if (!filenameEipNum) {
      return `No EIP number was found to be associated with filename ${filename}`;
    }

    return;
  };
}
