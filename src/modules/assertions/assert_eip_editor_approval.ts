import { FileDiff } from "#domain";
import { getApprovals } from "#components";
import { requireEIPEditors } from "#assertions";

/** returns an error string if the PR does NOT have editor approval */
export const assertEIPEditorApproval = async (fileDiff: FileDiff) => {
  const approvals = await getApprovals();
  const editors = requireEIPEditors(fileDiff);

  const isApproved = approvals.find((approver) => editors.includes(approver));
  if (!isApproved) {
    return `This PR requires review from one of [${editors.join(", ")}]`;
  } else return;
};
