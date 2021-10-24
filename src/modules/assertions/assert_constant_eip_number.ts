import { FileDiff } from "src/domain";

/**
 * asserts that eip number in both filename and header has not changed
 *
 * @returns error or undefined
 */
export const assertConstantEipNumber = ({ head, base }: FileDiff) => {
  const filenameNumMatches = base.filenameEipNum === head.filenameEipNum;
  const fileNumMatches = base.eipNum === head.eipNum;

  if (!(filenameNumMatches && fileNumMatches)) {
    return [
      `Base EIP has number ${base.eipNum} which was changed`,
      `to head ${head.eipNum}; EIP number changing is not allowd`
    ].join(" ");
  } else return;
};
