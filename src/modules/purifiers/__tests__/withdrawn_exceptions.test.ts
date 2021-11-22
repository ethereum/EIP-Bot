import { testResultsFactory } from "src/tests/factories/testResultsFactory";
import { withdrawnExceptionPurifier } from "../withdrawn_exceptions";
import { EipStatus } from "src/domain";

describe("withdrawn purifier", () => {
  it("should purify if author changes status to withdrawn", () => {
    const testResults = testResultsFactory({
      errors: {
        headerErrors: {
          constantStatusError: "this is testing the change",
          validStatusError: "withdrawn is not technically allowed"
        },
        approvalErrors: {
          isEditorApprovedError:
            "for other status changes editor approval is required"
        }
      },
      fileDiff: {
        // the head is what counts because constantStatusError tells you if it changed
        head: {
          status: EipStatus.withdrawn
        }
      }
    });
    const purified = withdrawnExceptionPurifier(testResults);
    expect(purified.errors.headerErrors.validStatusError).toBeUndefined();
    expect(purified.errors.headerErrors.constantStatusError).toBeUndefined();
    expect(
      purified.errors.approvalErrors.isEditorApprovedError
    ).toBeUndefined();
  });
});
