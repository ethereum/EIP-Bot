import { FileDiff } from "src/domain";

/**
 * asserts that the eip number in the filename and in the header are the same
 *
 * @returns error or undefined
 */
export const assertFilenameAndFileNumbersMatch = ({ head, base }: FileDiff) => {
  const headMatchesSelf = head.filenameEipNum === head.eipNum;

  if (!headMatchesSelf) {
    return `EIP header in file ${head.name} does not match: ${base.name}`;
  } else return;
};
