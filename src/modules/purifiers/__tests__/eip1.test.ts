import { testResultsFactory } from "src/tests/factories/testResultsFactory";
import { EIP1Purifier } from "#/purifiers";

describe("eip1 purifier", () => {
  it("should purify appropriate fields if it IS eip 1", () => {
    const testResults = testResultsFactory({
      errors: {
        headerErrors: {
          validStatusError: "eip1 can be whatever status b/c of editor approvals"
        },
        approvalErrors: {
          enoughEditorApprovalsForEIP1Error: "...",
          isAuthorApprovedError: "just in case..",
          isEditorApprovedError: "just a repeat of ^"
        },
        authorErrors: {
          hasAuthorsError: "eip1 doesn't have resolvable authors"
        }
      },
      fileDiff: {
        // should only be considering base
        base: {
          eipNum: 1
        },
        head: {
          eipNum: 100
        }
      }
    });
    const purified = EIP1Purifier(testResults);
    expect(purified.errors.headerErrors.validStatusError).toBeUndefined();
    expect(purified.errors.approvalErrors.isAuthorApprovedError).toBeUndefined();
    expect(
      purified.errors.approvalErrors.isEditorApprovedError
    ).toBeUndefined();
    expect(
      purified.errors.authorErrors.hasAuthorsError
    ).toBeUndefined()
    expect(purified.errors.approvalErrors.enoughEditorApprovalsForEIP1Error).toBeDefined()
  });

  it("should purify itself if not eip 1", () => {
    const testResults = testResultsFactory({
      errors: {
        headerErrors: {
          validStatusError: "eip1 can be whatever status b/c of editor approvals"
        },
        approvalErrors: {
          enoughEditorApprovalsForEIP1Error: "...",
          isAuthorApprovedError: "just in case..",
          isEditorApprovedError: "just a repeat of ^"
        },
        authorErrors: {
          hasAuthorsError: "eip1 doesn't have resolvable authors"
        }
      },
      fileDiff: {
        // should only be considering base
        base: {
          eipNum: 100
        },
        head: {
          eipNum: 100
        }
      }
    });
    const purified = EIP1Purifier(testResults);
    expect(purified.errors.headerErrors.validStatusError).toBeDefined();
    expect(purified.errors.approvalErrors.isAuthorApprovedError).toBeDefined();
    expect(
      purified.errors.approvalErrors.isEditorApprovedError
    ).toBeDefined();
    expect(
      purified.errors.authorErrors.hasAuthorsError
    ).toBeDefined()
    expect(purified.errors.approvalErrors.enoughEditorApprovalsForEIP1Error).toBeUndefined()
  });
});
