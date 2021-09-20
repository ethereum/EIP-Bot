import { FileDiff } from "#domain";

/**
 * assert that the status hasn't changed, if it hasn't changed then also
 * assert that the given status is one of the auto-mergable statuses
 *
 * @returns error or undefined
 */
 export const assertConstantStatus = ({ head, base }: FileDiff) => {
  if (head.status !== base.status) {
    return [
      `eip-${base.eipNum} state was changed from ${base.status}`,
      `to ${head.status}`
    ].join(" ");
  } else return;
};
