import { TestResults } from "src/domain";
import { cloneDeep } from "lodash";

export const EIP1Purifier = (testResults: TestResults) => {
  const { errors } = cloneDeep(testResults);
  const eipNum = testResults.fileDiff.base.eipNum;

  if (eipNum === 1) {
    // authors not required for EIP1
    errors.approvalErrors.isAuthorApprovedError = undefined;
  } else {
    errors.approvalErrors.enoughEditorApprovalsForEIP1Error = undefined;
  }

  // clear error in all other cases
  return { ...testResults, errors };
};
