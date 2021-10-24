import { File, FILE_RE } from "src/domain";
import { requireFilenameEipNum } from "#assertions";

/**
 * Accepts a file and returns whether or not its name is valid
 *
 * @param errors a list to add any errors that occur to
 * @returns {boolean} is the provided file's filename valid?
 */
export const assertValidFilename = (file: NonNullable<File>) => {
  const filename = file.filename;

  // File name is formatted correctly and is in the EIPS folder
  const match = filename.search(FILE_RE);
  if (match === -1) {
    return `Filename ${filename} is not in EIP format 'EIPS/eip-####.md'`;
  }

  // EIP number is defined within the filename and can be parsed
  const filenameEipNum = requireFilenameEipNum(filename);
  if (!filenameEipNum) {
    return `No EIP number was found to be associated with filename ${filename}`;
  }

  return;
};
