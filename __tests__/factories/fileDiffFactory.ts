import { EipStatus, FileDiff } from "src/utils";
import { RecursivePartial } from "__tests__/testutils";


export const FileDiffFactory = (
  overrides: RecursivePartial<FileDiff> = {}
): FileDiff => {
  const defaults = {
    head: {
      eipNum: 2930,
      status: EipStatus.draft,
      authors: new Set(["@vbuterin", "@holiman"]),
      name: "eip-2930.md",
      filenameEipNum: 2930
    },
    base: {
      eipNum: 2930,
      status: EipStatus.draft,
      authors: new Set(["@vbuterin", "@holiman"]),
      name: "eip-2930.md",
      filenameEipNum: 2930
    }
  };

  return {
    head: {
      ...defaults.head,
      ...overrides.head
    } as FileDiff["head"],
    base: {
      ...defaults.base,
      ...overrides.base
    } as FileDiff["base"]
  };
};
