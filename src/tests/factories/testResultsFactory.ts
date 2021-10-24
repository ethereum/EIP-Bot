import { TestResults } from "src/domain";
import { RecursivePartial } from "src/tests/testutils";
import { FileDiffFactory } from "./fileDiffFactory";

const defaults: RecursivePartial<TestResults> & {
  fileDiff: TestResults["fileDiff"];
} = {
  fileDiff: FileDiffFactory()
};

export const testResultsFactory = (
  overrides: RecursivePartial<TestResults> = {}
): TestResults => {
  return {
    errors: {
      fileErrors: {
        ...defaults.errors?.fileErrors,
        ...overrides.errors?.fileErrors
      },
      headerErrors: {
        ...defaults.errors?.headerErrors,
        ...overrides.errors?.headerErrors
      },
      authorErrors: {
        ...defaults.errors?.authorErrors,
        ...overrides.errors?.authorErrors
      },
      approvalErrors: {
        ...defaults.errors?.approvalErrors,
        ...overrides.errors?.approvalErrors
      }
    },
    fileDiff: {
      base: {
        ...defaults.fileDiff.base,
        ...overrides.fileDiff?.base
      },
      head: {
        ...defaults.fileDiff.head,
        ...overrides.fileDiff?.head
      }
    },
    authors: overrides.authors || defaults.authors
  };
};
