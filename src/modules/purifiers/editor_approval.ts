import { EipStatus, TestResults } from "src/domain";
import { cloneDeep } from "lodash";
import { OR } from "#/utils";
import { statusChangeAllowedPurifier } from "./status_change_allowed";

export const editorApprovalPurifier = (testResults: TestResults) => {
  const _testResults = cloneDeep(testResults);
  const { errors, fileDiff } = _testResults;

  const isEditorApproved = !errors.approvalErrors.isEditorApprovedError;
  const isNewFile = !!errors.fileErrors.filePreexistingError;
  // I call the purifier because we shouldn't mention editors if
  // the status change is allowed
  const statusChangedAllowed =
    !statusChangeAllowedPurifier(testResults).errors.headerErrors
      .constantStatusError;

  const isInvalidStatus = !!errors.headerErrors.validStatusError;
  const isAuthorApproved = !errors.approvalErrors.isAuthorApprovedError;
  const isFinal = OR(
    fileDiff.head.status === EipStatus.final,
    fileDiff.base.status === EipStatus.final
  );

  if (isEditorApproved && isNewFile) {
    errors.fileErrors.filePreexistingError = undefined;
  }

  if (isEditorApproved) {
    errors.headerErrors.validStatusError = undefined;
  }

  const mentionEditors = OR(
    !isEditorApproved && isNewFile,
    !isEditorApproved && isInvalidStatus,
    !isEditorApproved && !statusChangedAllowed,
    // Final EIPs should first get author approval then mention editors
    !isEditorApproved && isAuthorApproved && isFinal
  );
  if (!mentionEditors) {
    errors.approvalErrors.isEditorApprovedError = undefined;
  }

  return { ...testResults, errors };
};
