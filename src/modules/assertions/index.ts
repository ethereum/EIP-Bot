import { RequireAuthors } from "./require_authors";
import { RequireEditors } from "./require_editors";
import { RequireFilePreexisting } from "./require_file_preexisting";
import {
  castTo,
  CORE_EDITORS,
  ERC_EDITORS,
  FileDiff,
  INFORMATIONAL_EDITORS,
  INTERFACE_EDITORS,
  META_EDITORS,
  NETWORKING_EDITORS
} from "src/domain";
import { requirePr } from "#/assertions/require_pr";
import { getPullRequestFiles, getRepoFilenameContent } from "src/infra";
import { AssertValidFilename } from "#/assertions/assert_valid_filename";
import { RequireFilenameEIPNum } from "./require_filename_eip_num";
import { getApprovals } from "../approvals";
import { getParsedContent } from "../utils/get_parsed_content";
import { AssertHasAuthors } from "#/assertions/assert_has_authors";

export * from "./require_pull_number";
export * from "./require_event";
export * from "./require_pr";
export * from "./assert_is_approved_by_authors";
export * from "./require_files";
export * from "./assert_filename_and_file_numbers_match";
export * from "./assert_constant_eip_number";
export * from "./assert_valid_status";
export * from "./assert_eip_editor_approval";
export * from "./assert_eip1_editor_approvals";
export * from "./assert_constant_status";

const _RequireAuthors = new RequireAuthors()
export const requireAuthors = castTo<
  typeof _RequireAuthors.requireAuthors
  >((...args) => {
  // @ts-ignore
  return _RequireAuthors.requireAuthors(...args);
});

const _RequireEIPEditors = new RequireEditors({
  requireAuthors,
  ERC_EDITORS,
  CORE_EDITORS,
  INFORMATIONAL_EDITORS,
  INTERFACE_EDITORS,
  META_EDITORS,
  NETWORKING_EDITORS
});
export const requireEIPEditors = (fileDiff?: FileDiff) =>
  _RequireEIPEditors.requireEIPEditors(fileDiff);

const _RequireFilePreexisting = new RequireFilePreexisting(
  requirePr,
  getRepoFilenameContent
);
export const requireFilePreexisting = castTo<
  typeof _RequireFilePreexisting.requireFilePreexisting
>((...args) => {
  // @ts-ignore
  return _RequireFilePreexisting.requireFilePreexisting(...args);
});

const _RequireFilenameEIPNum = new RequireFilenameEIPNum({
  getPullRequestFiles,
  requirePr,
  requireEIPEditors,
  getApprovals,
  getParsedContent
});
export const requireFilenameEipNum = castTo<
  typeof _RequireFilenameEIPNum.requireFilenameEipNum
>((...args) => {
  // @ts-ignore
  return _RequireFilenameEIPNum.requireFilenameEipNum(...args);
});

const _AssertValidFilename = new AssertValidFilename({
  requireFilenameEipNum
});
export const assertValidFilename = castTo<
  typeof _AssertValidFilename.assertValidFilename
>((...args) => {
  // @ts-ignore
  return _AssertValidFilename.assertValidFilename(...args);
});

const _AssertHasAuthors = new AssertHasAuthors();
export const assertHasAuthors = castTo<
  typeof _AssertHasAuthors.assertHasAuthors
  >((...args) => {
  // @ts-ignore
  return _AssertHasAuthors.assertHasAuthors(...args);
});


