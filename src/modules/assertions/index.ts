import { requireAuthors } from "#assertions/require_authors";
import { RequireEditors } from "./require_editors";
import {
  CORE_EDITORS,
  ERC_EDITORS,
  FileDiff,
  INFORMATIONAL_EDITORS,
  INTERFACE_EDITORS,
  META_EDITORS,
  NETWORKING_EDITORS
} from "src/domain";

export * from "./require_pull_number";
export * from "./require_event";
export * from "./require_authors";
export * from "./require_pr";
export * from "./assert_has_authors";
export * from "./assert_is_approved_by_authors";
export * from "./assert_valid_filename";
export * from "./require_filename_eip_num";
export * from "./require_files";
export * from "./assert_filename_and_file_numbers_match";
export * from "./assert_constant_eip_number";
export * from "./assert_valid_status";
export * from "./require_file_preexisting";
export * from "./assert_eip_editor_approval";
export * from "./assert_eip1_editor_approvals";
export * from "./assert_constant_status";

const _requireEIPEditors = new RequireEditors({
  requireAuthors,
  ERC_EDITORS,
  CORE_EDITORS,
  INFORMATIONAL_EDITORS,
  INTERFACE_EDITORS,
  META_EDITORS,
  NETWORKING_EDITORS
});
export const requireEIPEditors = (fileDiff?: FileDiff) =>
  _requireEIPEditors.requireEIPEditors(fileDiff);
