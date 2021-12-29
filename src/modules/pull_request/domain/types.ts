import { ChangeTypes } from "src/domain";

export interface IGithubPullRequest {
  postComment: (string) => Promise<void>;
  updateLabels: (labels: ChangeTypes[]) => Promise<void>;
}
