import { EIPCategory, FileDiff } from "#domain";
import { IRequireEditors } from "#assertions/Domain/types";

export class RequireEditors implements IRequireEditors {
  public requireAuthors: (fileDiff: FileDiff) => string[];
  public ERC_EDITORS: () => string[];
  public CORE_EDITORS: () => string[];
  constructor({ requireAuthors, ERC_EDITORS, CORE_EDITORS }) {
    this.requireAuthors = requireAuthors;
    this.ERC_EDITORS = ERC_EDITORS;
    this.CORE_EDITORS = CORE_EDITORS;
  }

  // injected to make testing easier
  _requireEIPEditors(EDITORS: string[], fileDiff?: FileDiff) {
    EDITORS = EDITORS.map((i) => i.toLowerCase());
    if (fileDiff) {
      const authors = this.requireAuthors(fileDiff);
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
  }

  requireEIPEditors(fileDiff?: FileDiff) {
    const { ERC_EDITORS, CORE_EDITORS } = this;
    const isERC = fileDiff?.base.category === EIPCategory.erc;
    const isCore = fileDiff?.base.category === EIPCategory.core;

    if (isERC) {
      return this._requireEIPEditors(ERC_EDITORS(), fileDiff);
    }

    if (isCore) {
      return this._requireEIPEditors(CORE_EDITORS(), fileDiff);
    }

    throw Error(
      [
        `the fileDiff for '${fileDiff?.base.name}' with category '${fileDiff?.base.category}'`,
        `was neither seen to be a core or erc eip while fetching the editors. This should`,
        `never happen`
      ].join(" ")
    );
  }
}

