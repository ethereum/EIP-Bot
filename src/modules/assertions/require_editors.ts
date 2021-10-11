import { requireAuthors } from "#assertions";
import { CORE_EDITORS, EIPCategory, ERC_EDITORS, FileDiff } from "#domain";

// injected to make testing easier
const _requireEIPEditors =
  (_requireAuthors: typeof requireAuthors, EDITORS: string[]) =>
  (fileDiff?: FileDiff) => {
    EDITORS = EDITORS.map((i) => i.toLowerCase());
    if (fileDiff) {
      const authors = _requireAuthors(fileDiff);
      return EDITORS.filter((editor) => !authors.includes(editor));
    } else {
      console.warn(
        [
          "You are requesting all of the EIP_EDITORS, but an edgecase may exist where",
          "an editor is also an author; it's recommended that you instead request the",
          "editors with respect to a fileDiff"
        ].join(" ")
      );
      return EDITORS;
    }
  };

export const requireEIPEditors = (fileDiff: FileDiff) => {
  const isERC = fileDiff.base.category === EIPCategory.erc;
  const isCore = fileDiff.base.category === EIPCategory.core;

  console.log(ERC_EDITORS)
  if (isERC) {
    return _requireEIPEditors(requireAuthors, ERC_EDITORS())(fileDiff);
  }

  if (isCore) {
    return _requireEIPEditors(requireAuthors, CORE_EDITORS())(fileDiff);
  }

  throw Error(
    [
      `the fileDiff for '${fileDiff.base.name}' with category '${fileDiff.base.category}'`,
      `was neither seen to be a core or erc eip while fetching the editors. This should`,
      `never happen`
    ].join(" ")
  );
};

export const __tests__ = {
  _requireEIPEditors
}
