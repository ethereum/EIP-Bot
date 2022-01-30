import { TestResults } from "src/domain";
import { cloneDeep } from "lodash";

export const EIP1Purifier = (testResults: TestResults) => {
  const { errors } = cloneDeep(testResults);
  const eipNum = testResults.fileDiff.base.eipNum;

  if (eipNum === 1) {
    // authors not required for EIP1
    errors.approvalErrors.isAuthorApprovedError = undefined;
    // eip-1 doesn't have authors that are discernible so it can be ignored
    errors.authorErrors.hasAuthorsError = undefined;
    // this is a repeat of hasEnoughEditorApprovals
    errors.approvalErrors.isEditorApprovedError = undefined;
    // eip-1 must be reviewed by multiple editors, so we can allowed it to be
    // any status without saying so
    errors.headerErrors.validStatusError = undefined;
  } else {
    errors.approvalErrors.enoughEditorApprovalsForEIP1Error = undefined;
  }

  // clear error in all other cases
  return { ...testResults, errors };
};
