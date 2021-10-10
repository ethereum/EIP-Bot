import { EIP_NUM_RE } from "#domain";

/**
 * Extracts the EIP number from a given filename (or returns null)
 * @param filename EIP filename
 */
export const requireFilenameEipNum = (filename: string) => {
  const eipNumMatch = filename.match(EIP_NUM_RE);
  if (!eipNumMatch || eipNumMatch[1] === undefined) {
    throw new Error(`EIP file name must be eip-###.md`);
  }
  return eipNumMatch && parseInt(eipNumMatch[1]);
};
