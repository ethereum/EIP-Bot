import {
  assertCategory,
  AUTHOR_RE,
  File,
  FileDiff,
  FormattedFile,
  FrontMatterAttributes,
  isDefined,
  isNockNoMatchingRequest,
  matchAll,
  ParsedContent,
  PR
} from "src/domain";
import { IFileDiff } from "#/file/domain/types";
import { github } from "src/infra";

export class FileDiffInfra implements IFileDiff {
  constructor(
    public requireFilenameEipNum: (path: string) => Promise<number>,
    public requirePr: () => Promise<PR>,
    public getParsedContent: (
      filename: string,
      sha: string
    ) => Promise<ParsedContent>
  ) {}

  /**
   * Accepts a file and returns the information of that file at the beginning
   * and current state of the PR; can be used to verify changes
   *
   * @param file given file name + diff to be done
   * @returns the formatted file content at the head and base of the PR
   */
  getFileDiff = async (file: NonNullable<File>): Promise<FileDiff> => {
    const pr = await this.requirePr();
    const filename = file.filename;

    // Get and parse head and base file
    const head = await this.getParsedContent(filename, pr.head.sha);
    // if the base file is new this will error, so use head instead
    const base = await this.getParsedContent(filename, pr.base.sha).catch(
      (err) => {
        const shouldAddToRecords = isNockNoMatchingRequest(err);
        if (shouldAddToRecords) {
          throw err;
        }
        return head;
      }
    );

    // Organize information cleanly
    return {
      head: await this.formatFile(head),
      base: await this.formatFile(base)
    };
  };

  formatFile = async (file: ParsedContent): Promise<FormattedFile> => {
    const filenameEipNum = await this.requireFilenameEipNum(file.path);

    return {
      eipNum: file.content.attributes[FrontMatterAttributes.eip],
      status:
        file.content.attributes[FrontMatterAttributes.status]?.toLowerCase(),
      authors: await this.getAuthors(
        file.content.attributes[FrontMatterAttributes.author]
      ),
      name: file.name,
      filenameEipNum,
      category: assertCategory({
        maybeCategory: file.content.attributes[FrontMatterAttributes.category],
        fileName: file.name,
        maybeType: file.content.attributes[FrontMatterAttributes.type]
      }).category,
      type: assertCategory({
        maybeCategory: file.content.attributes[FrontMatterAttributes.category],
        fileName: file.name,
        maybeType: file.content.attributes[FrontMatterAttributes.type]
      }).type
    };
  };

  getAuthors = async (rawAuthorList?: string) => {
    if (!rawAuthorList) return;

    const resolveAuthor = async (author: string) => {
      if (author[0] === "@") {
        return author.toLowerCase();
      } else {
        // Email address
        const queriedUser = await github.resolveUserByEmail(author);
        if (!queriedUser) return;
        return queriedUser.toLowerCase();
      }
    };

    const authors = matchAll(rawAuthorList, AUTHOR_RE, 1);
    const resolved = await Promise.all(authors.map(resolveAuthor)).then((res) =>
      res.filter(isDefined)
    );
    return new Set(resolved);
  };
}
