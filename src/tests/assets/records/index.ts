import { MockRecord, requireMockMethod } from "src/domain";
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
   * @summary: a change to eip-1 that's not able to discern the authors
   */
  PR4499 = "4499",
  /**
   *
   * @summary: the bot didn't fail gracefully on an asset file because the filename
   * provided was just the file's name instead of the path; I made all of the uses
   * of requireEIPNumber use path instead
   * @description: the bot reported
   * > ## (fail) eip-3448.md
   * > - eip-3448 state was changed from draft to review
   * > - This PR requires review from one of [@micahzoltu, @lightclient, @axic]
   * > ## (fail) assets/eip-3448/MetaProxyFactory.sol
   * > - 'MetaProxyFactory.sol' must be in eip-###.md format; this error will be overwritten upon relevant editor approval
   *
   * but it should have had a graceful failure on the assets/eip-3448/MetaProxyFactory.sol
   *
   * The problem was that it was evaluating the filename (MetaProxyFactory.sol) instead
   * of the path (assets/eip-3448/MetaProxyFactory.sol) so the code had no way
   * of knowing.
   */
  PR4506 = "4506",
  /**
   * @summary: this pull request was approved by an editor but it still said that it was not
   *
   * @description: 
   * The bug here was a result of the fact that github limits the number of
   * responses it can return. At the time of this pull request the max number of
   * reviews that could be returned was 30. But there were closer to 60 on the
   * pull request. So when the bot requested reviews, it got back a truncated
   * list that lacked the editor's approval. To fix this I built in a mechanism
   * to get all reviews (no matter how many) and I increased the max to 100.
   */
  PR4361 = "4361"
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
    (record) => record.req?.method && requireMockMethod(record.req.method)
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
  const PR3654_1 = await import("./3654/1.json");
  const PR3654_2 = await import("./3654/2.json");
  const PR3623 = await import("./3623.json");
  const PR4189 = await import("./4189.json");
  const PR4478 = await import("./4478.json");
  const PR4499 = await import("./4499.json");
  const PR4506 = await import("./4506.json");
  const PR4361 = await import("./4361.json");

  assertMethods(PR3767);
  assertMethods(PR3676);
  assertMethods(PR3612);
  assertMethods(PR4192);
  assertMethods(PR3768_1);
  assertMethods(PR3768_2);
  assertMethods(PR3596);
  assertMethods(PR3654_1);
  assertMethods(PR3654_2);
  assertMethods(PR3623);
  assertMethods(PR4189);
  assertMethods(PR4478);
  assertMethods(PR4506);
  assertMethods(PR4361);

  const Records: { [k in keyof typeof SavedRecord]: MockRecord[] } = {
    PR3596: PR3596.default,
    PR3654_1: PR3654_1.default,
    PR3654_2: PR3654_2.default,
    PR3767: PR3767.default,
    PR3676: PR3676.default,
    PR3612: PR3612.default,
    PR4192: PR4192.default,
    PR3768_1: PR3768_1.default,
    PR3768_2: PR3768_2.default,
    PR3623: PR3623.default,
    PR4189: PR4189.default,
    PR4478: PR4478.default,
    PR4499: PR4499.default,
    PR4506: PR4506.default,
    PR4361: PR4361.default
  };
  return Records;
};
