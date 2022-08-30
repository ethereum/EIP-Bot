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
import { AssertValidFilename } from "#/assertions/assert_valid_filename";
import { RequireFilenameEIPNum } from "./require_filename_eip_num";
import { getApprovals } from "../approvals";
import { getParsedContent } from "../file/modules/get_parsed_content";
import { AssertHasAuthors } from "#/assertions/assert_has_authors";
import { AssertEIP1EditorApprovals } from "#/assertions/assert_eip1_editor_approvals";
import { github } from "src/infra";

export * from "./require_pull_number";
export * from "./require_pr";
export * from "./assert_is_approved_by_authors";
export * from "./require_files";
export * from "./assert_filename_and_file_numbers_match";
export * from "./assert_constant_eip_number";
export * from "./assert_valid_status";
export * from "./assert_eip_editor_approval";
export * from "./assert_constant_status";
export * from "./require_max_file_number";

const _RequireAuthors = new RequireAuthors();
export const requireAuthors = castTo<typeof _RequireAuthors.requireAuthors>(
  (...args) => {
    // @ts-ignore
    return _RequireAuthors.requireAuthors(...args);
  }
);

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
  github.getRepoFilenameContent
);
export const requireFilePreexisting = castTo<
  typeof _RequireFilePreexisting.requireFilePreexisting
>((...args) => {
  // @ts-ignore
  return _RequireFilePreexisting.requireFilePreexisting(...args);
});

const _RequireFilenameEIPNum = new RequireFilenameEIPNum({
  getPullRequestFiles: github.getPullRequestFiles,
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

const _AssertEIP1EditorApprovals = new AssertEIP1EditorApprovals(getApprovals);
export const assertEIP1EditorApprovals = castTo<
  typeof _AssertEIP1EditorApprovals.assertEIP1EditorApprovals
>((...args) => {
  // @ts-ignore
  return _AssertEIP1EditorApprovals.assertEIP1EditorApprovals(...args);
});
