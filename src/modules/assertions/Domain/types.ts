import { File, FileDiff } from "src/domain";
import { Opaque } from "type-fest";

export interface IRequireEditors {
  _requireEIPEditors: (EDITORS: string[], fileDiff?: FileDiff) => string[];
  requireEIPEditors: (fileDiff?: FileDiff) => string[];
}

export type PreexistingFile = Opaque<File>;

export interface IRequireFilePreexisting {
  requireFilePreexisting: (fileDiff: File) => Promise<PreexistingFile>;
}

export interface IAssertValidFilename {
  assertValidFilename: (file: NonNullable<File>) => Promise<string | undefined>;
}

export interface IRequireFilenameEIPNum {
  requireFilenameEipNum: (filename: string, path: string) => Promise<number>;
  attemptAssetGracefulTermination: (filename: string) => Promise<void>;
  attemptEditorApprovalGracefulTermination: (filename: string) => Promise<void>;
  attemptNewFileNoEIPNumber: (filename: string, path: string) => Promise<void>;
}

export interface IAssertHasAuthors {
  /**
   * assert that authors exist for the EIP at the PRs base commit
   *
   * @param file file diff of a given file
   * @returns list of raw author data
   */
  assertHasAuthors: (file: FileDiff) => string | undefined
}

export interface IRequireAuthors {
  /**
   * requires that authors exist and returns them else throw error
   *
   * @param file file diff of a given file
   * @returns list of raw author data
   */
   requireAuthors: (fileDiff: FileDiff) => string[]
}

