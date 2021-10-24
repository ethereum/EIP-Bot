import { FileDiff } from "src/domain";
import { requireAuthors } from "#assertions";
import { getApprovals } from "#approvals";

export const assertIsApprovedByAuthors = async (fileDiff: FileDiff) => {
  const approvals = await getApprovals();
  const authors = requireAuthors(fileDiff);

  // there exists an approver who is also an author
  const hasAuthorApproval = !!approvals.find((approver) =>
    authors.includes(approver)
  );

  if (!hasAuthorApproval) {
    return [
      `${fileDiff.head.name} requires approval from one of`,
      `(${authors.join(", ")})`
    ].join(" ");
  } else return;
};
