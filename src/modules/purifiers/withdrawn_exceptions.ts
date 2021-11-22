import { EipStatus, TestResults } from "src/domain";
import { cloneDeep } from "lodash";

export const withdrawnExceptionPurifier = (testResults: TestResults) => {
  const _testResults = cloneDeep(testResults);
  const { errors, fileDiff } = _testResults;

  const isChangingStatus = !!errors.headerErrors.constantStatusError;
  const isAuthorApproved = !errors.approvalErrors.isAuthorApprovedError;
  const isWithdrawnAtHead = fileDiff?.head.status === EipStatus.withdrawn;

  // the author is allowed to change the status to withdrawn without editor approval
  if (isChangingStatus && isAuthorApproved && isWithdrawnAtHead) {
    errors.approvalErrors.isEditorApprovedError = undefined;
    errors.headerErrors.constantStatusError = undefined;
    errors.headerErrors.validStatusError = undefined;
  }

  return {
    ...testResults,
    errors
  };
};
