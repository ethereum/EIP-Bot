"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.github = void 0;
const github_1 = require("@actions/github");
const domain_1 = require("src/domain");
const lodash_1 = __importDefault(require("lodash"));
const request_error_1 = require("@octokit/request-error");
const path = __importStar(require("path"));
const getEventName = () => {
    return github_1.context.eventName;
};
const getPullNumber = () => {
    return github_1.context.payload?.pull_request?.number || parseInt(process.env.PR_NUMBER, 10);
};
const getPullRequestFromNumber = (pullNumber) => {
    const github = (0, github_1.getOctokit)(domain_1.GITHUB_TOKEN).rest;
    return github.pulls
        .get({
        repo: github_1.context.repo.repo,
        owner: github_1.context.repo.owner,
        pull_number: pullNumber
    })
        .then((res) => {
        return res.data;
    });
};
/**
 * this recurses through github pages of reviews until none are left; it is
 * meant to avoid losing data if there's more data than can be retrieved in one
 * request
 * */
const getPullRequestReviews = async (pullNumber, page = 1) => {
    const Github = (0, github_1.getOctokit)(domain_1.GITHUB_TOKEN).rest;
    const { data: reviews } = await Github.pulls.listReviews({
        owner: github_1.context.repo.owner,
        repo: github_1.context.repo.repo,
        pull_number: pullNumber,
        per_page: 100,
        page
    });
    if (lodash_1.default.isEmpty(reviews)) {
        return reviews;
    }
    return getPullRequestReviews(pullNumber, page + 1).then((res) => reviews.concat(res));
};
const getPullRequestFiles = (pullNumber) => {
    const Github = (0, github_1.getOctokit)(domain_1.GITHUB_TOKEN).rest;
    return Github.pulls
        .listFiles({
        pull_number: pullNumber,
        repo: github_1.context.repo.repo,
        owner: github_1.context.repo.owner
    })
        .then((res) => res.data);
};
const getRepoFilenameContent = (filename, sha) => {
    const Github = (0, github_1.getOctokit)(domain_1.GITHUB_TOKEN).rest;
    try {
        return Github.repos
            .getContent({
            owner: github_1.context.repo.owner,
            repo: github_1.context.repo.repo,
            path: filename,
            ref: sha
        })
            .then((res) => res.data);
    }
    catch (err) {
        if (err instanceof request_error_1.RequestError) {
            if (err.status == 404) {
                return new Promise((resolve) => resolve({
                    type: "file",
                    size: 0,
                    name: path.basename(filename),
                    path: filename,
                    content: "",
                    encoding: "utf-8",
                    sha: sha,
                    url: "",
                    git_url: null,
                    html_url: null,
                    download_url: null,
                    _links: {
                        git: null,
                        html: null,
                        self: ""
                    }
                }));
                ;
            }
        }
        throw err;
    }
};
const requestReview = (pr, reviewer) => {
    const Github = (0, github_1.getOctokit)(domain_1.GITHUB_TOKEN).rest;
    return (Github.pulls
        .requestReviewers({
        owner: github_1.context.repo.owner,
        repo: github_1.context.repo.repo,
        pull_number: pr.number,
        reviewers: [reviewer]
    })
        // if an error occurs return undefined
        .catch((err) => { }));
};
const resolveUserByEmail = async (email) => {
    const Github = (0, github_1.getOctokit)(domain_1.GITHUB_TOKEN).rest;
    // @ts-ignore
    const { data: rawEmailSearch } = await Github.search.users({
        q: email
    });
    if (rawEmailSearch.total_count > 0 && rawEmailSearch.items[0] !== undefined) {
        return "@" + rawEmailSearch.items[0].login;
    }
    const { data: emailSearch } = await Github.search.users({
        q: `${email} in:email`
    });
    if (emailSearch.total_count === 1 && (0, domain_1.isDefined)(emailSearch.items[0])) {
        return "@" + emailSearch.items[0].login;
    }
    const local = email.split("@")[0];
    if (!local)
        return;
    const firstName = local.split(".")[0];
    const lastName = local.split(".")[1];
    if (!firstName || !lastName)
        return;
    const { data: nameSearch } = await Github.search.users({
        q: `fullname:${firstName} ${lastName} type:users`
    });
    if (nameSearch.total_count === 1 && (0, domain_1.isDefined)(nameSearch.items[0])) {
        return "@" + nameSearch.items[0].login;
    }
    return;
};
const getSelf = () => {
    const Github = (0, github_1.getOctokit)(domain_1.GITHUB_TOKEN).rest;
    return Github.users.getAuthenticated().then((res) => {
        return res.data;
    });
};
const getContextIssueComments = () => {
    const Github = (0, github_1.getOctokit)(domain_1.GITHUB_TOKEN).rest;
    return Github.issues
        .listComments({
        owner: github_1.context.repo.owner,
        repo: github_1.context.repo.repo,
        issue_number: getPullNumber()
    })
        .then((res) => res.data);
};
const updateComment = (commentId, message) => {
    const Github = (0, github_1.getOctokit)(domain_1.GITHUB_TOKEN).rest;
    return Github.issues
        .updateComment({
        owner: github_1.context.repo.owner,
        repo: github_1.context.repo.repo,
        comment_id: commentId,
        body: message
    })
        .catch((err) => {
        if (err?.request?.body) {
            err.request.body = JSON.parse(err.request.body).body;
        }
        throw err;
    });
};
const createCommentOnContext = (message) => {
    const Github = (0, github_1.getOctokit)(domain_1.GITHUB_TOKEN).rest;
    return Github.issues.createComment({
        owner: github_1.context.repo.owner,
        repo: github_1.context.repo.repo,
        issue_number: getPullNumber(),
        body: message
    });
};
const getContextLabels = async () => {
    const Github = (0, github_1.getOctokit)(domain_1.GITHUB_TOKEN).rest;
    const { data: issue } = await Github.issues.get({
        owner: github_1.context.repo.owner,
        repo: github_1.context.repo.repo,
        issue_number: getPullNumber()
    });
    const labels = issue.labels;
    return labels
        .map((label) => {
        if (typeof label === "string") {
            return label;
        }
        return label.name;
        // this will make it so that the only labels considered are ChangeTypes
    })
        .filter(domain_1.isDefined)
        .filter(domain_1.isChangeType);
};
const setLabels = async (labels) => {
    const Github = (0, github_1.getOctokit)(domain_1.GITHUB_TOKEN).rest;
    await Github.issues
        .setLabels({
        owner: github_1.context.repo.owner,
        repo: github_1.context.repo.repo,
        issue_number: getPullNumber(),
        // @ts-expect-error the expected type is (string[] & {name: string}[]) | undefined
        // but string[] and {name: string}[] cannot simultaneously coincide
        labels
    })
        .then((res) => res);
};
const addLabels = async (labels) => {
    const Github = (0, github_1.getOctokit)(domain_1.GITHUB_TOKEN).rest;
    // makes it easy to maintain the integration tests and the
    // responses from this are not used
    if ((0, domain_1.isMock)() || (0, domain_1.isTest)())
        return;
    // because of a weird type issue
    const { addLabels: _addLabels } = Github.issues;
    await _addLabels({
        owner: github_1.context.repo.owner,
        repo: github_1.context.repo.repo,
        issue_number: getPullNumber(),
        labels
    });
};
const removeLabels = async (labels) => {
    const Github = (0, github_1.getOctokit)(domain_1.GITHUB_TOKEN).rest;
    // makes it easy to maintain the integration tests and the
    // responses from this are not used
    if ((0, domain_1.isMock)() || (0, domain_1.isTest)())
        return;
    await Promise.all(
    // this will submit a max of three requests which is not enough to
    // rate limit
    labels.map((label) => Github.issues.removeLabel({
        owner: github_1.context.repo.owner,
        repo: github_1.context.repo.repo,
        issue_number: getPullNumber(),
        name: label
    })));
};
exports.github = {
    getSelf,
    resolveUserByEmail,
    requestReview,
    getRepoFilenameContent,
    getPullRequestFiles,
    getPullRequestReviews,
    getPullRequestFromNumber,
    getPullNumber,
    getEventName,
    getContextIssueComments,
    updateComment,
    createCommentOnContext,
    getContextLabels,
    setLabels,
    addLabels,
    removeLabels
};
//# sourceMappingURL=github.js.map