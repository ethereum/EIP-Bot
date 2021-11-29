import { requireEIPEditors } from "#/assertions";
import { EIP1_REQUIRED_EDITOR_APPROVALS, FileDiff } from "src/domain";
import { multiLineString } from "#/utils";
import { IAssertEIP1EditorApprovals } from "#/assertions/Domain/types";

export class AssertEIP1EditorApprovals implements IAssertEIP1EditorApprovals {
  constructor(public getApprovals: () => Promise<string[]>) {}

  assertEIP1EditorApprovals = async (fileDiff: FileDiff) => {
    const approvals = await this.getApprovals();

    const editors = requireEIPEditors(fileDiff);
    const editorApprovals = approvals.filter((approver) =>
      editors.includes(approver)
    );
    if (editorApprovals.length < EIP1_REQUIRED_EDITOR_APPROVALS) {
      return multiLineString(" ")(
        `Changes to EIP 1 require at least ${EIP1_REQUIRED_EDITOR_APPROVALS}`,
        `unique approvals from editors; there's current ${editorApprovals.length}`,
        `the remaining editors are ${editors
          .filter((editor) => editorApprovals.includes(editor))
          .join(", ")}`
      );
    } else return;
  };
}
