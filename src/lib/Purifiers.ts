import { cloneDeep, intersection, set } from "lodash";
import { EipStatus, TestResults } from "src/utils";

const ANY = (states: any[]) => states.filter(Boolean).length > 0;

export const stateChangeAllowedPurifier = (testResults: TestResults) => {
  const _testResults = cloneDeep(testResults);
  const { errors, fileDiff } = _testResults;

  const isStateChangeAllowed = ANY([
    // state changes to withdrawn from anything
    fileDiff?.head.status === EipStatus.withdrawn,
    // state changes from lastcall -> review
    fileDiff?.base.status === EipStatus.lastCall &&
      fileDiff?.head.status === EipStatus.review,
    // editors can approve state changes
    !errors.approvalErrors.isEditorApprovedError
  ]);

  if (isStateChangeAllowed) {
    // always clear the constant status error if changes are allowed
    errors.headerErrors.constantStatusError = undefined;
  }

  return {
    ...testResults,
    errors
  };
};

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

  const isInvalidStatus = errors.headerErrors.validStatusError;
  const mentionEditors = ANY([
    !isEditorApproved && isNewFile,
    !isEditorApproved && isInvalidStatus
  ]);
  if (!mentionEditors) {
    errors.approvalErrors.isEditorApprovedError = undefined;
  }

  return { ...testResults, errors };
};

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

/**
 * designed to collect the purified results and return the common paths;
 * this is useful because it means that if one error is purified in one
 * purifier but not in others it will be purified in this step, which
 * avoids race conditions and keeps logic linear and shallow (improves
 * readability)
 *
 * @param parent common ancestor between potentially mutated objects
 * @param objects mutated objects from ancestor
 * @returns common paths of the mutated objects relative to the parent
 */
export const innerJoinAncestors = (
  parent: TestResults,
  objects: TestResults[]
) => {
  const objectPaths = objects.map(getAllTruthyObjectPaths);
  const commonPaths = intersection(...objectPaths);
  const clearPaths = getAllTruthyObjectPaths(parent).filter(
    (path) => !commonPaths.includes(path)
  );

  return clearPaths.reduce(
    (obj, path) => set(obj, path, undefined),
    parent
  ) as TestResults;
};

export const getAllTruthyObjectPaths = (obj: object) => {
  function rKeys(o: object, path?: string) {
    if (!o) return;
    if (typeof o !== "object") return path;
    return Object.keys(o).map((key) =>
      rKeys(o[key], path ? [path, key].join(".") : key)
    );
  }

  return rKeys(obj).toString().split(",").filter(Boolean) as string[];
};
