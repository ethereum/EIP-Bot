import { context, getOctokit } from "@actions/github";
import {
  BOT_ID,
  cleanString,
  DEFAULT_BRANCH,
  EipStatus,
  extractBranchFromRef,
  formatDate,
  FrontMatterAttributes,
  GITHUB_TOKEN,
  Logs,
  MERGEABLE_CUTOFF,
  PR_KEY_LABELS,
  STAGNATABLE_STATUSES,
  STAGNATION_CUTOFF_MONTHS,
  SYNCHRONOUS_PROMISE_LIMIT,
  USERNAME_DELIMETER
} from "./constants";
import {
  ArrayLike,
  ContentFile,
  encodings,
  Encodings,
  Files,
  NodeEnvs,
  ParsedContent,
  PreExistingPR,
  SearchPR,
  UnArrayify,
  UnPromisify
} from "./types";
import frontmatter, { FrontMatterResult } from "front-matter";
import moment from "moment-timezone";
import pLimit from "p-limit";
import _ from "lodash";
import { Merge } from "type-fest";

export const limit = pLimit(SYNCHRONOUS_PROMISE_LIMIT);

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
      if (commit.commit.committer?.date) {
        return {
          eip,
          date: moment(commit.commit.committer.date)
        };
      }
      return {
        eip
      };
    });
};

type ReturnOf<T extends ({ ...any }: any) => Promise<any>> = UnPromisify<
  ReturnType<T>
>;
export const getIsValidStateEIP = (
  parsed: ReturnOf<typeof getParsedContent>["parsed"]
) => {
  const status = parsed.attributes[FrontMatterAttributes.status];
  if (!status) {
    console.error(
      "============",
      "failed to collect 'status' from the following parsed eip\n============\n",
      JSON.stringify(parsed, null, 2),
      "\n==========\nfailed with error:\n",
      parsed
    );
    return;
  }
  return STAGNATABLE_STATUSES.map(cleanString).includes(cleanString(status));
};

export const getEIPContent = async (eip: ReturnOf<typeof getCommitDate>) => {
  const res = await getParsedContent(eip.eip.path).catch((err) => {
    console.error(
      "============",
      "failed to collect EIP contents for the following eip\n============\n",
      JSON.stringify(eip, null, 2),
      "\n==========\nfailed with error:\n",
      err
    );
  });

  if (!res) return;

  const { content, parsed } = res;
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
      Logs.successfulBranch(branchName);
      return res.data;
    });
};

export const deleteBranch = (branchName: string) => {
  const github = getOctokit(GITHUB_TOKEN).rest;
  return github.git
    .deleteRef({
      owner: context.repo.owner,
      repo: context.repo.repo,
      ref: `heads/${branchName}`,
      sha: context.sha
    })
    .then((res) => {
      Logs.successfulBranchDeletion(branchName);
      return res.data;
    })
    .catch((err) => {
      console.log(`refs/heads/${branchName}`);
      console.log(err);
    });
};

type CommitProps = { file: ContentFile; branchName: string; content: string };
export const createFileUpdateCommit = ({
  file,
  branchName,
  content
}: CommitProps) => {
  const github = getOctokit(GITHUB_TOKEN).rest;
  const message = `Updating ${file.path} to status ${EipStatus.stagnant}`;

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
    .then(() => Logs.succesfulFileUpdate(file.path));
};

export const capitalize = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1);

type PRProps = {
  fromBranch: string;
  toBranch: string;
  title: string;
  body: string;
};
export const createPR = async ({
  fromBranch,
  toBranch,
  title,
  body
}: PRProps) => {
  const github = getOctokit(GITHUB_TOKEN).rest;
  const graphql = getOctokit(GITHUB_TOKEN).graphql;

  const PR = await github.pulls
    .create({
      repo: context.repo.repo,
      owner: context.repo.owner,
      base: toBranch,
      head: fromBranch,
      title,
      body,
      draft: true
    })
    .then((res) => {
      Logs.successfulPR(res.data.title);
      return res.data;
    });

  await github.issues
    .addLabels({
      repo: context.repo.repo,
      owner: context.repo.owner,
      issue_number: PR.number,
      labels: PR_KEY_LABELS
    })
    .then(() => {
      Logs.successfulKeyLabels();
    });

  // by first marking the PR as a draft and then active, it allows for
  // the merge bot to ignore it and not use unnecessary api bandwidth
  await graphql(`#graphql
    mutation {
      markPullRequestReadyForReview(
        input: {
          pullRequestId: "${PR.node_id}"
        }
      ){
        clientMutationId
      }
    }
  `).then(() => {
    Logs.successfulMarkReadyForReview(PR.number, PR.title);
  });

  return PR;
};

export const getAuthorsFromFile = async (
  parsedContent: FrontMatterResult<any>
) => {
  const rawAuthorList = parsedContent.attributes[FrontMatterAttributes.author];
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
  const authors: string[] = [...rawAuthorList.matchAll(AUTHOR_RE)].map(
    (value) => value[1]
  );
  const resolved = await Promise.all(
    authors.map((author) => resolveAuthor(author))
  );
  return new Set(resolved);
};

export const filterBoolean = <Arr extends any[]>(array: Arr) => {
  return array.filter(Boolean) as NonNullable<UnArrayify<Arr>>[];
};

/**
 * pull requests have special rate limiting (due to notifications) read more here:
 * https://www.gitmemory.com/issue/peter-evans/create-pull-request/855/900797502
 * https://docs.github.com/en/rest/guides/best-practices-for-integrators#dealing-with-secondary-rate-limits
 *  */
export const wait = (seconds: number) => {
  Logs.wait(seconds);
  return new Promise((r) => setTimeout(r, 1000 * seconds));
};

type GetCommitDate = UnPromisify<ReturnType<typeof getCommitDate>>;
type GetParsedContent = UnPromisify<ReturnType<typeof getParsedContent>>;
export const applyStagnantProtocol = async ({
  content,
  parsed,
  date
}: {
  eip: GetCommitDate["eip"];
  date: GetCommitDate["date"];
  parsed: GetParsedContent["parsed"];
  content: GetParsedContent["content"];
}) => {
  const EIPNum = parsed.attributes[FrontMatterAttributes.eip];
  const statusRegex = /(?<=status:).*/;
  const stagnant = ` ${capitalize(EipStatus.stagnant)}`;

  Logs.protocolStart(EIPNum);

  const now = formatDate(moment());
  const branchName = `mark-eip-${EIPNum}-stagnant-${now}`;

  await createBranch(branchName);
  await new Promise((r) => setTimeout(r, 1000));
  await createFileUpdateCommit({
    file: content.file,
    branchName,
    content: content.decoded.replace(statusRegex, stagnant)
  });

  const authors = await getAuthorsFromFile(parsed).then(
    (res) => res && [...res]
  );

  const authorLine =
    process.env.NODE_ENV === NodeEnvs.test
      ? `authors: \n`
      : `authors: ${authors?.join(USERNAME_DELIMETER)} \n`;

  await new Promise((r) => setTimeout(r, 1000));
  await createPR({
    fromBranch: branchName,
    toBranch: DEFAULT_BRANCH,
    title: `EIP-${EIPNum} ${EipStatus.stagnant} ${now}`,
    body: [
      `This EIP has not been active since ${formatDate(moment(date))};`,
      `which, is greater than the allowed time of ${STAGNATION_CUTOFF_MONTHS} months.\n\n`,
      authorLine
    ].join(" ")
  });

  await wait(5);
};

export const requireFiles = async (PRNum: number) => {
  const Github = getOctokit(GITHUB_TOKEN).rest;

  const files = await Github.pulls
    .listFiles({
      pull_number: PRNum,
      repo: context.repo.repo,
      owner: context.repo.owner
    })
    .then((res) => res.data);

  if (!files?.length) {
    throw new Error(
      [
        "There were no files found to be associated",
        "with the PR within context"
      ].join(" ")
    );
  }

  return files;
};

export const fetchBotCreatedPRs = (page = 1) => {
  const github = getOctokit(GITHUB_TOKEN).rest;

  const searchPattern = [
    `label:${PR_KEY_LABELS.join(" label:")}`,
    `is:pr`,
    `is:open`,
    `repo:${context.repo.owner}/${context.repo.repo}`
  ].join(" ");
  Logs.fetchingBotCreatedPRSearch(searchPattern, page);

  return github.search
    .issuesAndPullRequests({
      q: searchPattern,
      per_page: 100,
      page
    })
    .then(async (res) => {
      const data = res.data;
      if (data.total_count) {
        const PRNums = data.items.map((pr) => pr.number);
        Logs.successfulBotCreatedPRSearch(PRNums);
      } else {
        Logs.successfulBotCreatedPRSearchNoResult();
      }

      if (data.total_count - page * 100 > 0) {
        const nextPage = await fetchBotCreatedPRs(page + 1);
        const allPages: typeof data.items = data.items.concat(nextPage);
        return allPages;
      }

      return data.items;
    });
};

const requireOneFile = async (files: Files, PRNum: number) => {
  if (!(files.length > 1)) return files[0]?.filename;

  Logs.warnMultipleFiles(files, PRNum);
  Logs.closingPRDueToMultipleFiles(PRNum);
  await closePRByNum(PRNum);
  await wait(5);
  return;
};

export const fetchFilePathsFromPRNum = async (PRNum) => {
  const files = await requireFiles(PRNum);
  return await requireOneFile(files, PRNum);
};

export const closePRByNum = async (prNum: number) => {
  const github = getOctokit(GITHUB_TOKEN).rest;

  const PR = await github.pulls
    .update({
      owner: context.repo.owner,
      repo: context.repo.repo,
      pull_number: prNum,
      state: "closed"
    })
    .then((res) => {
      Logs.successfullyClosedPR(res.data.number, res.data.title);
      return res.data;
    });
  await deleteBranch(PR.head.ref);
};

export const closeRepeatPRs = async (PRs: PreExistingPR[]) => {
  const paths = PRs.map((pr) => pr.path);
  const repeats = _.uniq(paths.filter((v, i, a) => a.indexOf(v) !== i));
  if (!repeats.length) return;
  Logs.warnForRepeatPaths(repeats);
  const numsToClose = repeats
    .map((path) => PRs.filter((pr) => pr.path === path).map((pr) => pr.num))
    .flatMap((allNums) => allNums.slice(1));
  Logs.closingRepeatPRs(numsToClose);

  for (const prNum of numsToClose) {
    await closePRByNum(prNum);
    // long wait because this is allowed to be in parallel
    await wait(5);
  }
};

type PRDateDefined = Merge<
  Omit<PreExistingPR, "createdAt">,
  { createdAt: moment.Moment }
>;

export const mergeOldPR = (PR: PRDateDefined): Promise<void> => {
  const github = getOctokit(GITHUB_TOKEN).rest;
  const message = Logs.mergingOldPR(PR.path, PR.num, PR.createdAt);

  return github.pulls
    .merge({
      owner: context.repo.owner,
      repo: context.repo.repo,
      pull_number: PR.num,
      merge_method: "squash",
      commit_title: `(bot ${BOT_ID}) moving ${PR.path} to stagnant (#${PR.num})`,
      commit_message: message
    })
    .then(() => {
      Logs.mergedSuccessful();
    })
    .catch((err) => {
      Logs.failedToMerge(err);
    });
};

export const mergeOldPRs = async (PRs: PreExistingPR[]) => {
  const getIsMergeable = (PR: PreExistingPR): PR is PRDateDefined => {
    if (!PR.createdAt) return false;
    return PR.createdAt.isBefore(MERGEABLE_CUTOFF);
  };

  const mergeablePRs = PRs.filter(getIsMergeable);

  for (const PR of mergeablePRs) {
    await limit(() => mergeOldPR(PR));
    await wait(5);
  }
};

const fetchPRBranch = (PRNum: number) => {
  const github = getOctokit(GITHUB_TOKEN).rest;
  return github.pulls
    .get({
      repo: context.repo.repo,
      owner: context.repo.owner,
      pull_number: PRNum
    })
    .then((res) => res.data.head.ref);
};

export const fetchPreExistingEIPPaths = async (): Promise<PreExistingPR[]> => {
  const preExistingPRs = await fetchBotCreatedPRs();
  const PRs = await Promise.all(
    preExistingPRs.map(async (pr) => ({
      path: await limit(() => fetchFilePathsFromPRNum(pr.number)),
      num: pr.number,
      createdAt: moment(pr.created_at),
      branch: await limit(() => fetchPRBranch(pr.number))
    }))
  ).then((PRs) => PRs.filter((PR) => PR.path) as PreExistingPR[]);

  return PRs;
};

export const fetchNonBotPRs = (page = 1): Promise<SearchPR[]> => {
  const github = getOctokit(GITHUB_TOKEN).rest;

  const searchPattern = [
    `-label:${PR_KEY_LABELS.join(" -label:")}`,
    `is:pr`,
    `is:open`,
    `repo:${context.repo.owner}/${context.repo.repo}`
  ].join(" ");
  Logs.fetchingNonBotCreatedPRs(searchPattern, page);

  return github.search
    .issuesAndPullRequests({
      q: searchPattern,
      per_page: 100,
      page
    })
    .then(async (res) => {
      const data = res.data;
      if (data.total_count) {
        const PRNums = data.items.map((pr) => pr.number);
        Logs.successfulNonBotCreatedPRSearch(PRNums);
      } else {
        Logs.successfulNonBotCreatedPRSearchNoResult();
      }

      if (data.total_count - page * 100 > 0) {
        const nextPage = await fetchBotCreatedPRs(page + 1);
        const allPages: typeof data.items = data.items.concat(nextPage);
        return allPages;
      }

      return data.items;
    });
};

export const getPullRequestFiles = async (
  PR: SearchPR
): Promise<PreExistingPR[]> => {
  const Github = getOctokit(GITHUB_TOKEN).rest;
  const { data: files } = await Github.pulls.listFiles({
    pull_number: PR.number,
    repo: context.repo.repo,
    owner: context.repo.owner
  });

  const branch = await fetchPRBranch(PR.number);
  return files.map((file) => ({
    path: file.filename,
    num: PR.number,
    createdAt: moment(),
    author: PR.user?.login,
    branch
  }));
};

/**
 * Returns all files currently touchced by open pull requests
 * that are not created by the bot
 */
export const getFilePathsWithNonBotOpenPRs = async (): Promise<
  PreExistingPR[]
> => {
  const PRs = await fetchNonBotPRs();
  const AllPRFiles = await Promise.all(
    PRs.map(async (PR) => await limit(() => getPullRequestFiles(PR)))
  );

  const activeFiles = AllPRFiles.flat();
  Logs.fetchedActiveFiles(activeFiles.map((file) => file.path));
  return activeFiles;
};

export const closeNonSelfBotPRs = async () => {
  const Github = getOctokit(GITHUB_TOKEN).rest;
  const PRs = await fetchBotCreatedPRs();
  const { data: me } = await Github.users.getAuthenticated();
  const NonSelfPRs = PRs.filter((PR) => PR.user?.login !== me.login);

  const getComments = (PR: SearchPR) => {
    return Github.issues
      .listComments({
        repo: context.repo.repo,
        owner: context.repo.owner,
        issue_number: PR.number
      })
      .then((res) => res.data);
  };

  const closePR = async (PR: SearchPR) => {
    const comments = await getComments(PR).then((comments) =>
      comments.filter((comment) => comment.user?.login !== me.login)
    );
    if (comments.length) {
      Logs.abortClosingDueToCommentsOnPR(comments, PR.number);
      return;
    }

    Logs.closingDueToNonSelf(PR.number, PR.user?.login, me.login);
    await closePRByNum(PR.number);
    await wait(5);
  };

  for (const PR of NonSelfPRs) {
    await limit(() => closePR(PR));
  }
};

export const closeObsoletePRs = async (obsoletePRs: PreExistingPR[]) => {
  if (!obsoletePRs.length) {
    Logs.noObsoletePRFound();
    return;
  }

  const closePR = async (PR: PreExistingPR) => {
    Logs.closingDueToObsolete(PR.num);
    await closePRByNum(PR.num);
  };

  for (const PR of obsoletePRs) {
    await limit(() => closePR(PR));
    await wait(5);
  }
};

export const fetchOrphanedBranches = async (
  preexistingPRs: PreExistingPR[]
): Promise<string[]> => {
  const github = getOctokit(GITHUB_TOKEN).rest;
  const activeBranches = preexistingPRs.map((pr) => pr.branch);
  return github.git
    .listMatchingRefs({
      repo: context.repo.repo,
      owner: context.repo.owner,
      ref: "heads"
    })
    .then((res) => {
      const refs = res.data.map((ref) => ref.ref);
      Logs.foundRefs(refs);
      const branches = refs
        .map((ref) => extractBranchFromRef(ref))
        .filter((ref): ref is string => !!ref);
      Logs.foundBranches(branches);
      const orphanedBranches = _.difference(branches, activeBranches);

      if (!orphanedBranches.length) {
        Logs.noOrphanedBranchesFound();
        return [];
      }
      Logs.foundOrphanedBranches(orphanedBranches);
      return orphanedBranches;
    });
};

export const deleteOrphanedBranches = async (
  preexistingPRs: PreExistingPR[]
) => {
  const orphanedBranches = await fetchOrphanedBranches(preexistingPRs);
  for (const branch of orphanedBranches) {
    await deleteBranch(branch);
    await wait(5);
  }
};
