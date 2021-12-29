export interface IGithubPullRequest {
  postComment: (string) => Promise<void>
}
