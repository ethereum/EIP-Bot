import { TestResults } from "src/domain";
import { cloneDeep } from "lodash";
import { ANY } from "#/utils";
import { statusChangeAllowedPurifier } from "./status_change_allowed";

export const editorApprovalPurifier = (testResults: TestResults) => {
  const _testResults = cloneDeep(testResults);
  const { errors } = _testResults;

  const isEditorApproved = !errors.approvalErrors.isEditorApprovedError;
  const isNewFile = !!errors.fileErrors.filePreexistingError;

  if (isEditorApproved && isNewFile) {
    errors.fileErrors.filePreexistingError = undefined;
  }

  if (isEditorApproved) {
    errors.headerErrors.validStatusError = undefined;
  }

  // I call the purifier because we shouldn't mention editors if
  // the status change is allowed
  const statusChangedAllowed =
    !statusChangeAllowedPurifier(testResults).errors.headerErrors
      .constantStatusError;

  const isInvalidStatus = errors.headerErrors.validStatusError;
  const mentionEditors = ANY([
    !isEditorApproved && isNewFile,
    !isEditorApproved && isInvalidStatus,
    !isEditorApproved && !statusChangedAllowed
  ]);
  if (!mentionEditors) {
    errors.approvalErrors.isEditorApprovedError = undefined;
  }

  return { ...testResults, errors };
};
