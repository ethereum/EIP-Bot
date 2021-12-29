import { initGeneralTestEnv } from "src/tests/testutils";
import { GithubInfra } from "src/infra";
import { PullRequestGithubApiLogs } from "../log";
import { GithubPullRequest } from "../github_pull_request";
import { ChangeTypes, MockedFunctionObject } from "src/domain";

describe("update labels", () => {
  initGeneralTestEnv();
  const githubRepoMock: MockedFunctionObject<GithubInfra> = {
    setLabels: jest.fn(),
    getContextLabels: jest.fn()
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

    expect(logsMock.labelsMatch).toBeCalled()
    expect(githubRepoMock.setLabels).not.toBeCalled()
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

    expect(logsMock.labelsMatch).not.toBeCalled()
    expect(githubRepoMock.setLabels).toBeCalled()
    expect(logsMock.labelsToBeChanged).toBeCalled();

    const call = logsMock.labelsToBeChanged?.mock.calls[0]!
    expect(call[2]).toEqual([ChangeTypes.statusChange])
    expect(call[3]).toEqual([ChangeTypes.ambiguous])
  });
});
