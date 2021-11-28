import { isMockMethod, MockRecord } from "src/domain";
import { CriticalError } from "src/domain/exceptions";

export enum SavedRecord {
  /**
   * **SHOULD FAIL**
   *
   * Summary: editor approval wasn't required if the author of the PR was an editor
   *
   * Explanation: if an editor is an author of an EIP and they submit a PR, then the
   * bot will assume that it has been approved by the editor. But this shouldn't happen.
   * The fix to this bug was considering EIP_EDITORS to be dynamic based on the eip / file
   * at hand. So if an editor is an author they won't be consider an editor for that test.
   * */
  PR3670 = "3670",
  PR3596 = "3596",
  /** **SHOULD PASS**
   *
   *  Summary: wasn't passing despite editor approval
   *
   *  Explanation: The cause of the bug was that the EIP_EDITORS list had capitals in it,
   *  so when it was checking if it was in the list it wouldn't match MicahZoltu
   *  to micahzoltu. And so it failed.
   */
  PR3654_1 = "3654_1",
  /** **SHOULD FAIL**
   *
   *  Summary: editors weren't mentioned if there was only a valid status error
   *
   *  Explanation: The cause of this bug was that despite there being a valid status error
   *  (i.e. status is Final) and that requiring editor approval the logic
   *  that actually collected the mentions didn't account for it. So I added that
   *  logic and it was golden
   */
  PR3654_2 = "3654_2",
  /**
   * **SHOULD PASS**
   *
   * @summary: [false alarm] greg opened a pull request and it automatically merged for
   *  an unknown reason. There were no editor reviews.
   *
   * @description: This was perceived as an error because greg moved the status from
   * draft to review at first but then reverted this change. In this case it was
   * expected behavior to auto merge; but it was incorrect interpreted.
   */
  PR3767 = "3767",
  /**
   * @summary: a pull request changed the status from last call to review,
   * it was caught by the linter but the editors weren't mentioned and they
   * were presumably not required
   *
   * @description:
   */
  PR3676 = "3676",
  /**
   * **SHOULD PASS**
   *
   * @summary: multi-file PR change with bot
   */
  PR3612 = "3612",
  /**
   * **SHOULD FAIL**
   *
   * @summary: multi-file PR that does not have the necessary reviews for it to pass
   */
  PR4192 = "4192",
  /**
   * **SHOULD SUCCEED**
   *
   * @summary: this is one where the bot mentioned the email of the user when
   * it couldn't find the username. Either try to
   */
  PR3768_1 = "3768_1",
  /**
   * **SHOULD FAIL**
   *
   * @summary: Same as PR3768_1 but in this case I deleted the author's review;
   * the goal is to use this PR to verify that an author with an email won't be
   * mentioned.
   */
  PR3768_2 = "3768_2",
  /**
   * **SHOULD PASS**
   *
   * @summary: PR3623 was approved by the author but it didn't merge, so this
   * was a bug where author's approval didn't actually merge anything
   */
  PR3623 = "3623",
  /**
   * **SHOULD PASS**
   *
   * @summary: PR3581 makes changes to a non-eip file which we would like to
   * support, when this record was added this was a newly added feature
   */
  PR3581 = "3581",
  /**
   * @summary: this is an example PR that was used to implement the feature
   * that authors be allowed to submit a PR to mark their EIP withdrawn and
   * that should be merged automatically
   */
  PR4189 = "4189",
  /**
   * @summary: this pull request automatically merged despite the tests failing
   * it was due to the fact unhandled errors never triggered a critical failure
   */
  PR4478 = "4478",
  /**
   * NOTE: this is up to date as of 11/26/2021, the PR is open as of writing this
   * @summary: this is a PR that is adding a new eip file that has not had its
   * eip number assigned yet. The bot was complaining about the fact the initial
   * file name was EIPS/{summary_of_eip}.md instead of EIPS/eip-####.md; it was
   * requested that the bot allow for this and instead notify the editors
   *
   * p.s. this should fail with an error that mentions editors need to assign
   * an eip number
   */
  PR4393 = "4393",
  /**
   * @summary: a change to eip-1 that's not able to discern the authors
   */
  PR4499 = "4499"
}

/**
 * This will error if the provided string is not a known SavedRecord
 * @param maybeSavedRecord a string corresponding to a known SavedRecord
 */
export function assertSavedRecord(
  maybeSavedRecord: string
): asserts maybeSavedRecord is SavedRecord {
  const savedRecords = Object.values(SavedRecord);

  // @ts-expect-error savedRecords is actually a string[]
  if (!savedRecords.includes(maybeSavedRecord)) {
    throw new CriticalError(
      `${maybeSavedRecord} is not a SavedRecord, the options are ${savedRecords}`
    );
  }
}

const assertMethods = (records: { default: MockRecord[] }) => {
  records.default.map(
    (record) => record.req?.method && isMockMethod(record.req.method)
  );
};
export const getMockRecords = async () => {
  const PR3767 = await import("./3767.json");
  const PR3676 = await import("./3676.json");
  const PR3612 = await import("./3612.json");
  const PR4192 = await import("./4192.json");
  const PR3768_1 = await import("./3768/1.json");
  const PR3768_2 = await import("./3768/2.json");
  const PR3596 = await import("./3596.json");
  const PR3670 = await import("./3670.json");
  const PR3654_1 = await import("./3654/1.json");
  const PR3654_2 = await import("./3654/2.json");
  const PR3623 = await import("./3623.json");
  const PR3581 = await import("./3581.json");
  const PR4189 = await import("./4189.json");
  const PR4478 = await import("./4478.json");
  const PR4393 = await import("./4393.json");
  const PR4499 = await import("./4499.json");

  assertMethods(PR3767);
  assertMethods(PR3676);
  assertMethods(PR3612);
  assertMethods(PR4192);
  assertMethods(PR3768_1);
  assertMethods(PR3768_2);
  assertMethods(PR3596);
  assertMethods(PR3670);
  assertMethods(PR3654_1);
  assertMethods(PR3654_2);
  assertMethods(PR3623);
  assertMethods(PR3581);
  assertMethods(PR4189);
  assertMethods(PR4478);
  assertMethods(PR4393);

  const Records: { [k in keyof typeof SavedRecord]: MockRecord[] } = {
    PR3596: PR3596.default,
    PR3670: PR3670.default,
    PR3654_1: PR3654_1.default,
    PR3654_2: PR3654_2.default,
    PR3767: PR3767.default,
    PR3676: PR3676.default,
    PR3612: PR3612.default,
    PR4192: PR4192.default,
    PR3768_1: PR3768_1.default,
    PR3768_2: PR3768_2.default,
    PR3623: PR3623.default,
    PR3581: PR3581.default,
    PR4189: PR4189.default,
    PR4478: PR4478.default,
    PR4393: PR4393.default,
    PR4499: PR4499.default
  };
  return Records;
};
