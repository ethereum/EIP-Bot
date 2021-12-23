import { EipStatus, TestResults } from "src/domain";
import { cloneDeep } from "lodash";
import { ANY } from "#/utils";

export const statusChangeAllowedPurifier = (testResults: TestResults) => {
  const _testResults = cloneDeep(testResults);
  const { errors, fileDiff } = _testResults;

  const isStatusChangeAllowed = ANY([
    // state changes from lastcall -> review
    fileDiff?.base.status === EipStatus.lastCall &&
      fileDiff?.head.status === EipStatus.review,
    // editors can approve state changes
    !errors.approvalErrors.isEditorApprovedError
  ]);

  if (isStatusChangeAllowed) {
    // always clear the constant status error if changes are allowed
    errors.headerErrors.constantStatusError = undefined;
  }

  return {
    ...testResults,
    errors
  };
};
