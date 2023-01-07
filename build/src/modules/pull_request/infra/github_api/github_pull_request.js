"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GithubPullRequest = void 0;
const domain_1 = require("src/domain");
const lodash_1 = __importDefault(require("lodash"));
class GithubPullRequest {
    constructor(github, logs) {
        this.github = github;
        this.logs = logs;
    }
    async postComment(message) {
        const me = await this.github.getSelf();
        const comments = await this.github.getContextIssueComments();
        // If comment already exists, update it
        for (const comment of comments) {
            if (comment.user?.login == me.login) {
                if (comment.body != message) {
                    await this.github.updateComment(comment.id, message);
                }
                return;
            }
        }
        await this.github.createCommentOnContext(message);
    }
    async updateLabels(labels) {
        const currentRaw = await this.github.getContextLabels();
        // filters out unrelated tags so it doesn't change those
        const current = lodash_1.default.intersection(currentRaw, Object.values(domain_1.ChangeTypes));
        const diff = lodash_1.default.xor(labels, currentRaw);
        if (lodash_1.default.isEmpty(diff)) {
            return this.logs.labelsMatch(current, labels);
        }
        const toRemove = lodash_1.default.intersection(current, diff);
        const toAdd = lodash_1.default.intersection(labels, diff);
        this.logs.labelsToBeChanged(current, labels, toAdd, toRemove);
        if ((0, domain_1.isDefined)(toRemove)) {
            await this.github.removeLabels(toRemove);
        }
        if ((0, domain_1.isDefined)(toAdd)) {
            await this.github.addLabels(toAdd);
        }
    }
}
exports.GithubPullRequest = GithubPullRequest;
//# sourceMappingURL=github_pull_request.js.map