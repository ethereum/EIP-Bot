import { context, getOctokit } from "@actions/github";
import {
  cleanString,
  FrontMatterAttributes,
  GITHUB_TOKEN,
  WITHDRAWABLE_STATUSES
} from "./constants";
import {
  ArrayLike,
  ContentFile,
  encodings,
  Encodings,
  NodeEnvs,
  ParsedContent,
  UnArrayify,
  UnPromisify
} from "./types";
import frontmatter from "front-matter";

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
): Promise<{ content: ContentFile; parsed: ParsedContent["content"] }> => {
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
    content: data,
    parsed: frontmatter(decodeData(data))
  };
};

export const setDebugContext = async (debugEnv?: NodeJS.ProcessEnv) => {
  const env = { ...process.env, ...debugEnv };
  process.env = env;

  // By instantiating after above it allows it to initialize with custom env
  const context = require("@actions/github").context;

  context.payload.pull_request = {
    base: {
      sha: env.BASE_SHA
    },
    head: {
      sha: env.HEAD_SHA
    },
    number: parseInt(env.PULL_NUMBER || "") || 0
  };

  if (env.NODE_ENV === NodeEnvs.test) {
    context.repo = {
      owner: env.REPO_OWNER_NAME,
      repo: env.REPO_NAME
    };
  } else {
    // @ts-ignore
    context.repo.owner = env.REPO_OWNER_NAME;
    // @ts-ignore
    context.repo.repo = env.REPO_NAME;
  }

  context.payload.repository = {
    // @ts-ignore
    name: env.REPO_NAME,
    owner: {
      key: "",
      // @ts-ignore
      login: env.REPO_OWNER_NAME,
      name: env.REPO_OWNER_NAME
    },
    full_name: `${env.REPO_OWNER}/${env.REPO_NAME}`
  };
  context.eventName = env.EVENT_TYPE;
  context.sha = env.SHA
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


type ReturnOf<T extends ({...any}: any) => Promise<any>> = UnPromisify<ReturnType<T>>
export const getIsValidStateEIP = async (
  parsed: ReturnOf<typeof getParsedContent>["parsed"]
) => {
  const status = parsed.attributes[FrontMatterAttributes.status];
  return WITHDRAWABLE_STATUSES.map(cleanString).includes(cleanString(status));
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
  return github.git.createRef({
    owner: context.repo.owner,
    repo: context.repo.repo,
    ref: `refs/heads/${branchName}`,
    sha: context.sha
  })
}
