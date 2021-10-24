import { FileDiff } from "#domain";

export interface IRequireEditors {
  _requireEIPEditors: (EDITORS: string[], fileDiff?: FileDiff) => string[];
  requireEIPEditors: (fileDiff: FileDiff) => string[];
}
