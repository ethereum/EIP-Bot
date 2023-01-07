"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateLabels = void 0;
const github_pull_request_1 = require("#/pull_request/infra/github_api/github_pull_request");
const domain_1 = require("src/domain");
const infra_1 = require("src/infra");
const log_1 = require("../infra/github_api/log");
const PullRequest = new github_pull_request_1.GithubPullRequest(infra_1.github, log_1.Logs);
exports.updateLabels = (0, domain_1.castTo)((args) => {
    return PullRequest.updateLabels(args);
});
//# sourceMappingURL=update_labels.js.map