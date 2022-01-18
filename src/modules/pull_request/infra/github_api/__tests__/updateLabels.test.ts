import { initGeneralTestEnv } from "src/tests/testutils";
import { GithubInfra } from "src/infra";
import { PullRequestGithubApiLogs } from "../log";
import { GithubPullRequest } from "../github_pull_request";
import { ChangeTypes, MockedFunctionObject } from "src/domain";

describe("update labels", () => {
  initGeneralTestEnv();
  const githubRepoMock: MockedFunctionObject<GithubInfra> = {
    getContextLabels: jest.fn(),
    addLabels: jest.fn(),
    removeLabels: jest.fn()
  };
  const logsMock: MockedFunctionObject<PullRequestGithubApiLogs> = {
    labelsMatch: jest.fn(),
    labelsToBeChanged: jest.fn()
  };
  const PullRequest = new GithubPullRequest(
    githubRepoMock as any,
    logsMock as any
  );

  it("should find matching", async () => {
    githubRepoMock.getContextLabels?.mockResolvedValueOnce([
      ChangeTypes.newEIPFile,
      ChangeTypes.statusChange
    ]);

    await PullRequest.updateLabels([
      ChangeTypes.statusChange,
      ChangeTypes.newEIPFile
    ]);

    expect(logsMock.labelsMatch).toBeCalled();
    expect(githubRepoMock.addLabels).not.toBeCalled();
    expect(githubRepoMock.removeLabels).not.toBeCalled();
  });

  it("should find difference", async () => {
    githubRepoMock.getContextLabels?.mockResolvedValueOnce([
      ChangeTypes.newEIPFile,
      ChangeTypes.ambiguous
    ]);

    await PullRequest.updateLabels([
      ChangeTypes.statusChange,
      ChangeTypes.newEIPFile
    ]);

    expect(logsMock.labelsMatch).not.toBeCalled();
    expect(githubRepoMock.addLabels).toBeCalled();
    expect(githubRepoMock.removeLabels).toBeCalled();
    expect(logsMock.labelsToBeChanged).toBeCalled();

    const call = logsMock.labelsToBeChanged?.mock.calls[0]!;
    expect(call[2]).toEqual([ChangeTypes.statusChange]);
    expect(call[3]).toEqual([ChangeTypes.ambiguous]);
  });

  const genAddRemoveTests = (otherLabels: string[]) => {
    it("adds and removes when appropriate", async () => {
      githubRepoMock.getContextLabels?.mockResolvedValueOnce([
        ChangeTypes.newEIPFile,
        ChangeTypes.ambiguous,
        ...otherLabels as any
      ]);

      // i.e. adds statusChange and removes ambiguous
      await PullRequest.updateLabels([
        ChangeTypes.statusChange,
        ChangeTypes.newEIPFile
      ]);

      expect(githubRepoMock.addLabels).toBeCalled();
      expect(githubRepoMock.removeLabels).toBeCalled();

      expect(githubRepoMock.addLabels?.mock.calls[0]![0].length).toEqual(1)
      expect(githubRepoMock.removeLabels?.mock.calls[0]![0].length).toEqual(1)
    });

    it("adds and does not remove when appropriate", async () => {
      githubRepoMock.getContextLabels?.mockResolvedValueOnce([
        ChangeTypes.newEIPFile,
        ChangeTypes.ambiguous,
        ...otherLabels as any
      ]);

      // i.e. adds statusChange
      await PullRequest.updateLabels([
        ChangeTypes.statusChange,
        ChangeTypes.ambiguous,
        ChangeTypes.newEIPFile
      ]);

      expect(githubRepoMock.addLabels).toBeCalled();
      expect(githubRepoMock.removeLabels).not.toBeCalled();

      expect(githubRepoMock.addLabels?.mock.calls[0]![0].length).toEqual(1)
    });

    it("removes and does not add when appropriate", async () => {
      githubRepoMock.getContextLabels?.mockResolvedValueOnce([
        ChangeTypes.newEIPFile,
        ChangeTypes.ambiguous,
        ...otherLabels as any
      ]);

      // i.e. removes ambiguous
      await PullRequest.updateLabels([ChangeTypes.newEIPFile]);

      expect(githubRepoMock.addLabels).not.toBeCalled();
      expect(githubRepoMock.removeLabels).toBeCalled();

      expect(githubRepoMock.removeLabels?.mock.calls[0]![0].length).toEqual(1)
    });

    it("does not add or remove when appropriate", async () => {
      githubRepoMock.getContextLabels?.mockResolvedValueOnce([
        ChangeTypes.newEIPFile,
        ChangeTypes.ambiguous,
        ...otherLabels as any
      ]);

      // i.e. changes nothing
      await PullRequest.updateLabels([
        ChangeTypes.ambiguous,
        ChangeTypes.newEIPFile
      ]);

      expect(githubRepoMock.addLabels).not.toBeCalled();
      expect(githubRepoMock.removeLabels).not.toBeCalled();
    });
  }

  describe("add and remove testing no added fields", () => {
    genAddRemoveTests([])
  });

  describe("add and remove testing with added non-standard labels", () => {
    genAddRemoveTests(["field1,", "field4", "field5"])
  });
});
