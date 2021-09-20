import { ALLOWED_STATUSES, FileDiff } from "#domain";

/**
 * determines if the status of either the base or the head are
 * not auto mergeable. A non-auto mergeable status requires editor
 * approval
 *
 * @returns error or undefined
 */
 export const assertValidStatus = ({ head, base }: FileDiff) => {
  const allowedStatus = [...ALLOWED_STATUSES].join(" or ");
  if (!ALLOWED_STATUSES.has(head.status)) {
    return [
      `${head.name} is in state ${head.status} at the head commit,`,
      `not ${allowedStatus}; an EIP editor needs to approve this change`
    ].join(" ");
  } else if (!ALLOWED_STATUSES.has(base.status)) {
    const allowedStatus = [...ALLOWED_STATUSES].join(" or ");
    return [
      `${base.name} is in state ${base.status} at the base commit,`,
      `not ${allowedStatus}; an EIP editor needs to approve this change`
    ].join(" ");
  } else return;
};
