import { DEFAULT_ERRORS, File, TestResults } from "src/domain";
import { getFileDiff } from "#/file";
import {
  assertConstantEipNumber,
  assertConstantStatus,
  assertEIP1EditorApprovals,
  assertEIPEditorApproval,
  assertFilenameAndFileNumbersMatch,
  assertHasAuthors,
  assertIsApprovedByAuthors,
  assertValidFilename,
  assertValidStatus,
  requireAuthors,
  requireFilePreexisting
} from "#/assertions";
import { processError } from "src/domain/exceptions";

export const testFile = async (file: File): Promise<TestResults> => {
  // we need to define this here because the below logic can get very complicated otherwise
  const errors = DEFAULT_ERRORS;

  // file testing is not compatible (yet) with an initialy undefined file
  // so instead it's required here. It throws an exception for consistency
  const fileDiff = await getFileDiff(file);
  try {
    file = await requireFilePreexisting(file);
  } catch (err: any) {
    processError(err, {
      requirementViolation: (message) => {
        errors.fileErrors.filePreexistingError = message;
      }
    });

    errors.approvalErrors.isEditorApprovedError = await assertEIPEditorApproval(
      fileDiff
    );
    // new files are acceptable if an editor has approved
    if (errors.approvalErrors.isEditorApprovedError) {
      return {
        errors,
        fileDiff
      };
    }
  }

  errors.approvalErrors.isEditorApprovedError = await assertEIPEditorApproval(
    fileDiff
  );
  errors.approvalErrors.enoughEditorApprovalsForEIP1Error =
    await assertEIP1EditorApprovals(fileDiff);
  errors.fileErrors.validFilenameError = await assertValidFilename(file);
  errors.headerErrors.matchingEIPNumError =
    assertFilenameAndFileNumbersMatch(fileDiff);
  errors.headerErrors.constantEIPNumError = assertConstantEipNumber(fileDiff);
  errors.headerErrors.constantStatusError = assertConstantStatus(fileDiff);
  errors.headerErrors.validStatusError = assertValidStatus(fileDiff);
  errors.authorErrors.hasAuthorsError = assertHasAuthors(fileDiff);

  // if no authors then remaining items aren't relevant to check
  if (errors.authorErrors.hasAuthorsError) {
    return {
      errors,
      fileDiff
    };
  }

  errors.approvalErrors.isAuthorApprovedError = await assertIsApprovedByAuthors(
    fileDiff
  );
  return {
    errors,
    fileDiff,
    authors: requireAuthors(fileDiff)
  };
};
