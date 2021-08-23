import { context, getOctokit } from "@actions/github";
import {
  cleanString,
  FrontMatterAttributes,
  GITHUB_TOKEN,
  STAGNATABLE_STATUSES
} from "./constants";
import {
  ArrayLike,
  ContentFile,
  encodings,
  Encodings,
  ParsedContent,
  UnArrayify,
  UnPromisify
} from "./types";
import frontmatter, { FrontMatterResult } from "front-matter";
import { Moment } from "moment-timezone";

/** Ensures that encodings are as expected by octokit */
export function requireEncoding(
  maybeEncoding: string,
  context: string
): asserts maybeEncoding is Encodings {
  // any here because of https://github.com/microsoft/TypeScript/issues/26255
  if (!encodings.includes(maybeEncoding as any))
    throw new Error(`Unknown encoding of ${context}: ${maybeEncoding}`);
}

export const getParsedContent = async (
  path: string
): Promise<{
  content: { file: ContentFile; decoded: string };
  parsed: ParsedContent["content"];
}> => {
  const github = getOctokit(GITHUB_TOKEN).rest;
  const decodeData = (data: ContentFile) => {
    const encoding = data.encoding;
    requireEncoding(encoding, path);
    return Buffer.from(data.content, encoding).toString();
  };

  // Collect the file contents at the given sha reference frame
  const data = (await github.repos
    .getContent({
      owner: context.repo.owner,
      repo: context.repo.repo,
      path: path
    })
    .then((res) => res.data)) as ContentFile;

  // Assert type assumptions
  if (!data?.content) {
    throw `requested file at ${path} contains no content`;
  }

  // Return parsed information
  return {
    content: {
      file: data,
      // @ts-ignore
      decoded: decodeData(data)
    },
    parsed: frontmatter(decodeData(data))
  };
};

export const getEIPs = async () => {
  const github = getOctokit(GITHUB_TOKEN).rest;
  const eipPaths = await github.repos
    .getContent({
      repo: context.repo.repo,
      owner: context.repo.owner,
      path: "EIPS"
    })
    .then((res) => {
      const content = res.data as ArrayLike<typeof res.data>;
      for (const file of content) {
        file.path = `EIPS/${file.name}`;
      }
      return content;
    });

  return eipPaths;
};

type EIP = UnArrayify<UnPromisify<ReturnType<typeof getEIPs>>>;
export const getCommitDate = (eip: EIP) => {
  const github = getOctokit(GITHUB_TOKEN).rest;
  return github.repos
    .listCommits({
      repo: context.repo.repo,
      owner: context.repo.owner,
      path: eip.path,
      per_page: 1
    })
    .then((res) => {
      const commit = res.data[0];
      if (!commit) {
        throw new Error(`path ${eip.path} did not resolve to a commit`);
      }
      return {
        eip,
        date: commit.commit.committer?.date
      };
    });
};

type ReturnOf<T extends ({ ...any }: any) => Promise<any>> = UnPromisify<
  ReturnType<T>
>;
export const getIsValidStateEIP = async (
  parsed: ReturnOf<typeof getParsedContent>["parsed"]
) => {
  const status = parsed.attributes[FrontMatterAttributes.status];
  return STAGNATABLE_STATUSES.map(cleanString).includes(cleanString(status));
};

export const getEIPContent = async (eip: ReturnOf<typeof getCommitDate>) => {
  const { content, parsed } = await getParsedContent(eip.eip.path);
  return {
    content,
    parsed,
    ...eip
  };
};

export const createBranch = (branchName: string) => {
  const github = getOctokit(GITHUB_TOKEN).rest;
  return github.git
    .createRef({
      owner: context.repo.owner,
      repo: context.repo.repo,
      ref: `refs/heads/${branchName}`,
      sha: context.sha
    })
    .then((res) => {
      console.log("successfully created branch", branchName);
      return res.data;
    });
};

type CommitProps = { file: ContentFile; branchName: string; content: string };
export const createFileUpdateCommit = ({
  file,
  branchName,
  content
}: CommitProps) => {
  const github = getOctokit(GITHUB_TOKEN).rest;
  const message = `Updating ${file.path} to status Withdrawn`;

  return github.repos
    .createOrUpdateFileContents({
      repo: context.repo.repo,
      owner: context.repo.owner,
      message,
      branch: branchName,
      path: file.path,
      sha: file.sha,
      content: Buffer.from(content).toString("base64")
    })
    .then(() => console.log(message));
};

export const capitalize = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1);

type PRProps = {
  fromBranch: string;
  toBranch: string;
  title: string;
  body: string;
};
export const createPR = ({ fromBranch, toBranch, title, body }: PRProps) => {
  const github = getOctokit(GITHUB_TOKEN).rest;
  return github.pulls
    .create({
      repo: context.repo.repo,
      owner: context.repo.owner,
      base: toBranch,
      head: fromBranch,
      title,
      body
    })
    .then((res) => {
      console.log(`successfully created pull request titled ${res.data.title}`);
      return res.data;
    });
};

export const formatDate = (date: Moment) => {
  return date.format("(YYYY-MMM-Do@HH.m.s)");
};

export const getAuthorsFromFile = async (parsedContent: FrontMatterResult<any>) => {
  const rawAuthorList = parsedContent.attributes[FrontMatterAttributes.author]
  if (!rawAuthorList) return;

  const findUserByEmail = async (
    email: string
  ): Promise<string | undefined> => {
    const Github = getOctokit(GITHUB_TOKEN).rest;
    const { data: results } = await Github.search.users({ q: email });
    if (results.total_count > 0 && results.items[0] !== undefined) {
      return "@" + results.items[0].login;
    }
    console.warn(`No github user found, using email instead: ${email}`);
    return undefined;
  };

  const resolveAuthor = async (author: string) => {
    if (author[0] === "@") {
      return author.toLowerCase();
    } else {
      // Email address
      const queriedUser = await findUserByEmail(author);
      return (queriedUser || author).toLowerCase();
    }
  };

  const AUTHOR_RE = /[(<]([^>)]+)[>)]/gm;
  const authors = rawAuthorList.matchAll(AUTHOR_RE);
  const resolved = await Promise.all(
    [...authors].map((value) => value[0] && resolveAuthor(value[0]))
  );
  return new Set(resolved);
};
