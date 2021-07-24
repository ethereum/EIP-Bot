import { PR } from "src/utils";
import MockRecords from "assets/records";

export const PRFactory = (overrides: Partial<PR> = {}) => {
  const defaults: PR = MockRecords.PR3596[0]?.res.data;
  return {
    ...defaults,
    ...overrides
  };
};
