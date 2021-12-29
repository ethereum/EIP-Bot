import { FileDiffInfra } from "#/file/modules/file_diff_infra";
import { requireFilenameEipNum, requirePr } from "#/assertions";
import { PropsValue } from "src/domain";
import { getParsedContent } from "#/file/modules/get_parsed_content";

const _FileDiffInfra_ = new FileDiffInfra(
  requireFilenameEipNum,
  requirePr,
  getParsedContent
);

export const getFileDiff = (
  ...args: PropsValue<typeof _FileDiffInfra_.getFileDiff>
) => {
  return _FileDiffInfra_.getFileDiff(...args);
};
