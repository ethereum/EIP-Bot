import { PR } from "src/utils";
import { getMockRecords } from "assets/records";

export const PRFactory = async (overrides: Partial<PR> = {}) => {
  const Records = await getMockRecords();
  const defaults: PR = Records.PR3596[0]?.res.data;
  return {
    ...defaults,
    ...overrides
  };
};
