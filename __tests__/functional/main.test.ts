import { _TESTS_ } from "src/main";
import { MENTIONS_SEPARATOR } from "src/utils";
import { testResultsFactory } from "__tests__/factories/testResultsFactory";
import * as Assertions from "src/lib/Assertions";

describe("mentions", () => {
  describe("getAuthorMentions", () => {
    const { getAuthorMentions } = _TESTS_;
    const authors = ["author1", "author2", "author3"];
    it("should return authors if not approved by authors", () => {
      const testResults = testResultsFactory({
        authors,
        errors: {
          approvalErrors: {
            isAuthorApprovedError: "error"
          }
        }
      });
      const res = getAuthorMentions(testResults);
      expect(res).toBe(authors.join(MENTIONS_SEPARATOR));
    });

    it("should return undefined if no authors", () => {
      const testResults = testResultsFactory({
        errors: {
          approvalErrors: {
            isAuthorApprovedError: "error"
          }
        }
      });
      const res = getAuthorMentions(testResults);
      expect(res).toBeUndefined();
    });

    it("should return undefined if approved by authors", () => {
      const testResults = testResultsFactory({
        authors,
        errors: {
          approvalErrors: {
            // i.e. no error
            isAuthorApprovedError: undefined
          }
        }
      });
      const res = getAuthorMentions(testResults);
      expect(res).toBeUndefined();
    });
  });

  describe("getEditorMentions", () => {
    const { getEditorMentions } = _TESTS_;
    const editors = ["editor1", "editor2", "editor3"];
    const mockRequireEIPEditors = jest.fn().mockReturnValue(editors);

    beforeEach(async () => {
      jest.resetModules();
      jest
        .spyOn(Assertions, "requireEIPEditors")
        .mockImplementation(mockRequireEIPEditors);
      mockRequireEIPEditors.mockClear();
    });

    it("should return editors if the file is new and there's no editor approval", () => {
      const testResults = testResultsFactory({
        errors: {
          fileErrors: {
            filePreexistingError: "error"
          },
          approvalErrors: {
            isEditorApprovedError: "error"
          }
        }
      });
      const res = getEditorMentions(testResults);
      expect(res).toBe(editors.join(MENTIONS_SEPARATOR));
    });

    it("should return nothing if the file is new and there's editor approval", () => {
      const testResults = testResultsFactory({
        errors: {
          fileErrors: {
            filePreexistingError: "error"
          },
          approvalErrors: {
            isEditorApprovedError: undefined // no error
          }
        }
      });
      const res = getEditorMentions(testResults);
      expect(res).toBeUndefined();
    });

    it("should mention editors if not enough eip1 editor approvals", () => {
      const testResults = testResultsFactory({
        errors: {
          approvalErrors: {
            enoughEditorApprovalsForEIP1Error: "error"
          }
        }
      });
      const res = getEditorMentions(testResults);
      expect(res).toBe(editors.join(MENTIONS_SEPARATOR));
    });

    it("should mention editors if status is not automergeable and no editor approval", () => {
      const testResults = testResultsFactory({
        errors: {
          headerErrors: {
            validStatusError: "error"
          },
          approvalErrors: {
            isEditorApprovedError: "error"
          }
        }
      });
      const res = getEditorMentions(testResults);
      expect(res).toBe(editors.join(MENTIONS_SEPARATOR));
    });

    it("shouldn't mention editors if status is not automergeable and it has editor approval", () => {
      const testResults = testResultsFactory({
        errors: {
          headerErrors: {
            validStatusError: "error"
          },
          approvalErrors: {
            isEditorApprovedError: undefined // no error
          }
        }
      });
      const res = getEditorMentions(testResults);
      expect(res).toBeUndefined();
    });
  });

  describe("_getMentions", () => {
    const { _getMentions } = _TESTS_;
    const getAuthorMentionsMock = jest.fn();
    const getEditorMentionsMock = jest.fn();
    const getMentions = _getMentions(
      getEditorMentionsMock,
      getAuthorMentionsMock
    );
    const authors = ["author1", "author2"].join(MENTIONS_SEPARATOR);
    const editors = ["editor1", "editor2"].join(MENTIONS_SEPARATOR);

    beforeEach(() => {
      getAuthorMentionsMock.mockClear();
      getEditorMentionsMock.mockClear();
    });
    it("should handle no mentions", () => {
      const res = getMentions({} as any);
      expect(res).toBe("");
    });
    it("should handle only authors", () => {
      getAuthorMentionsMock.mockReturnValueOnce(authors);
      const res = getMentions({} as any);
      expect(res).toEqual(authors);
    });
    it("should handle only editors", () => {
      getEditorMentionsMock.mockReturnValueOnce(editors);
      const res = getMentions({} as any);
      expect(res).toEqual(editors);
    });
    it("should handle both editors and authors", () => {
      getAuthorMentionsMock.mockReturnValueOnce(authors);
      getEditorMentionsMock.mockReturnValueOnce(editors);
      const res = getMentions({} as any);
      // this is sensitive to the order, but the order shouldn't matter
      // if this breaks, just flip it around
      expect(res).toBe([editors, authors].join(MENTIONS_SEPARATOR));
    });
  });
});
