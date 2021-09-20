import { getApprovals } from "#components";
import { requireEIPEditors } from "#assertions";
import { EIP1_REQUIRED_EDITOR_APPROVALS, FileDiff } from "#domain";

export const assertEIP1EditorApprovals = async (fileDiff: FileDiff) => {
  const approvals = await getApprovals();

  const editors = requireEIPEditors(fileDiff);
  const editorApprovals = approvals.filter((approver) =>
    editors.includes(approver)
  );
  if (editorApprovals.length < EIP1_REQUIRED_EDITOR_APPROVALS) {
    return [
      `Changes to EIP 1 require at least ${EIP1_REQUIRED_EDITOR_APPROVALS}`,
      `unique approvals from editors, the editors are [${editors.join(", ")}]`
    ].join(" ");
  } else return;
};
