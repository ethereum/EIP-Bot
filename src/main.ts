import { setFailed } from "@actions/core";
import {
  // merge,
  postComment,
  requireEvent,
  assertFilePreexisting,
  assertValidFilename,
  requirePullNumber,
  requirePr,
  requireFiles,
  getFileDiff,
  assertFilenameAndFileNumbersMatch,
  assertConstantEipNumber,
  assertConstantAndValidStatus,
  assertHasAuthors,
  assertIsApprovedByAuthors,
  requireAuthors,
  requestReviewers
} from "./lib";
import { ERRORS, File } from "./utils";

/** If array length is 0 then this is undefined */
const nullableStringArray = <A extends (string | undefined)[]>(array: A) => {
  const filtered = array.filter(Boolean);
  if (filtered.length !== 0) {
    return filtered as string[]
  } else return;
}
// type NullableStringArray = ReturnType<typeof nullableStringArray>;

const testFile = async (file: File) => {
  const fileErrors = nullableStringArray([
    assertFilePreexisting(file),
    assertValidFilename(file)
  ]);

  if (fileErrors) {
    return {
      fileErrors
    };
  }

  const fileDiff = await getFileDiff(file);

  const headerErrors = nullableStringArray([
    assertFilenameAndFileNumbersMatch(fileDiff),
    assertConstantEipNumber(fileDiff),
    assertConstantAndValidStatus(fileDiff)
  ]);

  const authorErrors = nullableStringArray([assertHasAuthors(fileDiff)]);

  if (authorErrors) {
    return {
      fileErrors,
      headerErrors,
      authorErrors
    };
  }

  const approvalErrors = nullableStringArray(
    await Promise.all([assertIsApprovedByAuthors(fileDiff)])
  );

  return {
    fileErrors,
    headerErrors,
    authorErrors,
    approvalErrors,
    authors: requireAuthors(fileDiff)
  };
};

export const main = async () => {
  try {
    // Verify correct enviornment and request context
    requireEvent();
    requirePullNumber();
    await requirePr();

    // Collect the changes made in the given PR from base <-> head for eip files
    const files = await requireFiles();
    if (files.length !== 1) {
      throw "sorry only 1 file is supported right now";
    }
    const file = files[0] as File;

    // Collect errors for each file
    const {
      fileErrors,
      authorErrors,
      headerErrors,
      approvalErrors,
      authors
    } = await testFile(file);

    if (!fileErrors && !headerErrors && !authorErrors && !!approvalErrors && authors) {
      await requestReviewers(authors)
    }

    if (fileErrors || headerErrors || authorErrors || approvalErrors) {
      const errors = [
        fileErrors,
        authorErrors,
        headerErrors,
        approvalErrors
      ].filter(Boolean).flat() as string[];

      let mentions: string | undefined;
      if (!fileErrors && !authorErrors && !headerErrors && approvalErrors && authors) {
        mentions = authors.join(" ")
      }
      await postComment(errors, mentions);

      if (!process.env.SHOULD_MERGE) {
        throw "would not have merged";
      }
    }

    // if no errors, then merge
    if (!fileErrors && !headerErrors && !authorErrors && !approvalErrors) {
      // disabled initially to test behavior
      // return await merge(file);
    }
  } catch (error) {
    console.error(error);
    ERRORS.push(`An Exception Occured While Linting: ${error}`);
    console.log(ERRORS);
    setFailed(error.message);
  }
};
