import { FileDiffInfra } from "#/file/modules/file_diff_infra";
import { requireFilenameEipNum, requirePr } from "#/assertions";
import { PropsValue } from "src/domain";

const _FileDiffInfra_ = new FileDiffInfra(
  requireFilenameEipNum,
  requirePr
)

export const getFileDiff = (...args: PropsValue<typeof _FileDiffInfra_.getFileDiff>) => {
  return _FileDiffInfra_.getFileDiff(...args)
}
