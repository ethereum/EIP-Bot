import { File, FileDiff, FormattedFile, ParsedContent } from "src/domain";

export interface IFileDiff {
  getFileDiff: (file: NonNullable<File>) => Promise<FileDiff>;

  formatFile: (file: ParsedContent) => Promise<FormattedFile>;

  getParsedContent: (filename: string, sha: string) => Promise<ParsedContent>;

  getAuthors: (rawAuthorList?: string) => Promise<undefined | Set<string>>;
}
