import { intersection, set } from "lodash";
import { EipStatus, TestResults } from "src/utils";

const ANY = (states: boolean[]) => states.includes(true);

export const stateChangeAllowedPurifier = (testResults: TestResults) => {
  const { errors, fileDiff } = testResults;

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
    if (errors.headerErrors.constantStatusError) {
      // allows for the header to change to an invalid status
      errors.headerErrors.validStatusError = undefined;
    }
    // always clear the constant status error if changes are allowed
    errors.headerErrors.constantStatusError = undefined;
  }

  return {
    ...testResults,
    errors
  };
};

export const editorApprovalPurifier = (testResults: TestResults) => {
  const isEditorApproved =
    !testResults.errors.approvalErrors.isEditorApprovedError;
  const isNewFile = !!testResults.errors.fileErrors.filePreexistingError;

  if (isEditorApproved && isNewFile) {
    testResults.errors.fileErrors.filePreexistingError = undefined;
  }

  if (!isEditorApproved) {
    if (!isNewFile) {
      testResults.errors.approvalErrors.isEditorApprovedError = undefined;
    }
  }

  return testResults;
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
export const innerJoinAncestors = (parent: TestResults, objects: TestResults[]) => {
  function rKeys(obj: TestResults, path?: string) {
    if (!obj || typeof obj !== "object") return path;
    return Object.keys(obj).map((key) =>
      rKeys(obj[key], path ? [path, key].join(".") : key)
    );
  }

  const objectPaths = objects.map(
    (obj) => rKeys(obj).toString().split(",") as string[]
  );
  const commonPaths = intersection(...objectPaths);
  const clearPaths = rKeys(parent)
    .toString()
    .split(",")
    .filter((path) => commonPaths.includes(path));

  return clearPaths.reduce(
    (obj, path) => set(obj, path, undefined),
    parent
  ) as TestResults;
};
