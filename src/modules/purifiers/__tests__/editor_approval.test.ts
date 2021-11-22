import { testResultsFactory } from "src/tests/factories/testResultsFactory";
import { editorApprovalPurifier } from "#/purifiers";
import { EipStatus } from "src/domain";

describe("editor approval purifier", () => {
  it("editor approval should validStatusError & filePreexistingError", () => {
    const testResults = testResultsFactory({
      errors: {
        headerErrors: {
          validStatusError: "error"
        },
        fileErrors: {
          filePreexistingError: "error"
        },
        approvalErrors: {
          isEditorApprovedError: undefined // this infers that it's approved
        }
      }
    });
    const res = editorApprovalPurifier(testResults);
    expect(res.errors.headerErrors.validStatusError).toBeUndefined();
    expect(res.errors.fileErrors.filePreexistingError).toBeUndefined();
  });
  it("should mention editors if it's a new file", () => {
    const testResults = testResultsFactory({
      errors: {
        fileErrors: {
          filePreexistingError: "error"
        },
        approvalErrors: {
          isEditorApprovedError: "no editor approval"
        }
      }
    });
    const purified = editorApprovalPurifier(testResults);
    expect(purified.errors.approvalErrors.isEditorApprovedError).toBeDefined();
  });
  it("should mention editors if invalid status", () => {
    const testResults = testResultsFactory({
      errors: {
        headerErrors: {
          validStatusError: "invalid status"
        },
        approvalErrors: {
          isEditorApprovedError: "no editor approval"
        }
      }
    });
    const purified = editorApprovalPurifier(testResults);
    expect(purified.errors.approvalErrors.isEditorApprovedError).toBeDefined();
  });
  it("should not show editors if not author approved on final", () => {
    const testResults = testResultsFactory({
      errors: {
        approvalErrors: {
          isAuthorApprovedError: "no author approval",
          isEditorApprovedError: "no editor approval"
        }
      },
      fileDiff: {
        head: {
          status: EipStatus.final
        },
        base: {
          status: EipStatus.final
        }
      }
    });
    const purified = editorApprovalPurifier(testResults);
    expect(
      purified.errors.approvalErrors.isEditorApprovedError
    ).toBeUndefined();
  });
  it("should show editors if author approved on final", () => {
    const testResults = testResultsFactory({
      errors: {
        approvalErrors: {
          // in this case we assume author approval so no error
          isEditorApprovedError: "no editor approval"
        }
      },
      fileDiff: {
        head: {
          status: EipStatus.final
        },
        base: {
          status: EipStatus.final
        }
      }
    });
    const purified = editorApprovalPurifier(testResults);
    expect(purified.errors.approvalErrors.isEditorApprovedError).toBeDefined();
  });
  it("should not mention editors if there are no other errors", () => {
    const testResults = testResultsFactory({
      errors: {
        approvalErrors: {
          isEditorApprovedError: "no editor approval"
        }
      }
    });
    const purified = editorApprovalPurifier(testResults);
    expect(
      purified.errors.approvalErrors.isEditorApprovedError
    ).toBeUndefined();
  });
});
