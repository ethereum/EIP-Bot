import { File, FileDiff } from "src/domain";
import { Opaque } from "type-fest";

export interface IRequireEditors {
  _requireEIPEditors: (EDITORS: string[], fileDiff?: FileDiff) => string[];
  requireEIPEditors: (fileDiff: FileDiff) => string[];
}

export type PreexistingFile = Opaque<File>
export interface IRequireFilePreexisting {
  requireFilePreexisting: (fileDiff: File) => Promise<PreexistingFile>;
}
