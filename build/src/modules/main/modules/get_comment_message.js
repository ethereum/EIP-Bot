"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCommentMessage = void 0;
const domain_1 = require("src/domain");
const getCommentMessage = (results, header) => {
    if (!results.length)
        return "There were no results cc @alita-moore";
    const comment = [];
    comment.push(header || domain_1.COMMENT_HEADER);
    comment.push("---");
    for (const { filename, errors, successMessage, type } of results) {
        const classification = () => {
            comment.push(`| classification |`);
            comment.push(`| ------------- |`);
            comment.push(`| \`${type}\` |`);
        };
        if (!errors) {
            comment.push(`## (pass) ${filename}`);
            classification();
            const message = `- ` + (successMessage || "passed!");
            comment.push(message);
            continue;
        }
        comment.push(`## (fail) ${filename}`);
        classification();
        for (const error of errors) {
            comment.push(`- ${error}`);
        }
    }
    return comment.join("\n");
};
exports.getCommentMessage = getCommentMessage;
//# sourceMappingURL=get_comment_message.js.map