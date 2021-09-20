import { requireAuthors } from "#assertions";
import { FileDiff, EIP_EDITORS } from "#domain";

// injected to make testing easier
export const _requireEIPEditors = (
  _requireAuthors: typeof requireAuthors,
  EDITORS: string[]
) => (fileDiff?: FileDiff) => {
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
/**
 * returns the list of EIP editors, optionally removes any that may also be authors
 * if a file diff is provided
 */
export const requireEIPEditors = _requireEIPEditors(
  requireAuthors,
  EIP_EDITORS
);
