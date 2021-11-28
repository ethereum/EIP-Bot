import { ContentFile, ParsedContent, requireEncoding } from "src/domain";
import { getRepoFilenameContent } from "src/infra";
import { UnexpectedError } from "src/domain/exceptions";
import frontmatter from "front-matter";

export const getParsedContent = async (
  filename: string,
  sha: string
): Promise<ParsedContent> => {
  const decodeData = (data: ContentFile) => {
    const encoding = data.encoding;
    requireEncoding(encoding, filename);
    return Buffer.from(data.content, encoding).toString();
  };

  // Collect the file contents at the given sha reference frame
  const data = await getRepoFilenameContent(filename, sha).then(
    (res) => res as ContentFile
  );

  // Assert type assumptions
  if (!data?.content) {
    throw new UnexpectedError(
      `requested file ${filename} at ref sha ${sha} contains no content`
    );
  }
  if (!data?.path) {
    throw new UnexpectedError(
      `requested file ${filename} at ref sha ${sha} has no path`
    );
  }
  if (!data?.name) {
    throw new UnexpectedError(
      `requested file ${filename} at ref sha ${sha} has no name`
    );
  }

  // Return parsed information
  return {
    path: data.path,
    name: data.name,
    content: frontmatter(decodeData(data))
  };
};
