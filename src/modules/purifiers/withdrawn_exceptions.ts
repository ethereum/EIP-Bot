import { EipStatus, TestResults } from "src/domain";
import { cloneDeep } from "lodash";
import { is } from "#/purifiers/error_properties";

export const withdrawnExceptionPurifier = (testResults: TestResults) => {
  const _testResults = cloneDeep(testResults);
  const { errors, fileDiff } = _testResults;

  const isChangingStatus = fileDiff?.base.status !== EipStatus.withdrawn;
  const isAuthorApproved = !errors.approvalErrors.isAuthorApprovedError;
  const isWithdrawnAtHead = fileDiff?.head.status === EipStatus.withdrawn;

  // the author is allowed to change the status to withdrawn without editor approval
  if (isChangingStatus && isAuthorApproved && isWithdrawnAtHead) {
    errors.approvalErrors.isEditorApprovedError = undefined;
    errors.headerErrors.constantStatusError = undefined;
    errors.headerErrors.validStatusError = undefined;
  }

  // all minor changes are allowed from status withdrawn (with author approval)
  if (isAuthorApproved && isWithdrawnAtHead && is.minorChange(errors)) {
    errors.headerErrors.validStatusError = undefined;
    errors.approvalErrors.isEditorApprovedError = undefined;
  }

  return {
    ...testResults,
    errors
  };
};
