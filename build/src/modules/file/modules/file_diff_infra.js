"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileDiffInfra = void 0;
const domain_1 = require("src/domain");
const infra_1 = require("src/infra");
class FileDiffInfra {
    constructor(requireFilenameEipNum, requirePr, getParsedContent) {
        this.requireFilenameEipNum = requireFilenameEipNum;
        this.requirePr = requirePr;
        this.getParsedContent = getParsedContent;
        /**
         * Accepts a file and returns the information of that file at the beginning
         * and current state of the PR; can be used to verify changes
         *
         * @param file given file name + diff to be done
         * @returns the formatted file content at the head and base of the PR
         */
        this.getFileDiff = async (file) => {
            const pr = await this.requirePr();
            const filename = file.filename;
            // Get and parse head and base file
            const head = await this.getParsedContent(filename, pr.head.sha);
            // if the base file is new this will error, so use head instead
            const base = await this.getParsedContent(filename, pr.base.sha).catch((err) => {
                const shouldAddToRecords = (0, domain_1.isNockNoMatchingRequest)(err);
                if (shouldAddToRecords) {
                    throw err;
                }
                return head;
            });
            // Organize information cleanly
            return {
                head: await this.formatFile(head),
                base: await this.formatFile(base)
            };
        };
        this.formatFile = async (file) => {
            const filenameEipNum = await this.requireFilenameEipNum(file.path);
            return {
                eipNum: file.content.attributes[domain_1.FrontMatterAttributes.eip],
                status: file.content.attributes[domain_1.FrontMatterAttributes.status]?.toLowerCase(),
                authors: await this.getAuthors(file.content.attributes[domain_1.FrontMatterAttributes.author]),
                name: file.name,
                filenameEipNum,
                category: (0, domain_1.assertCategory)({
                    maybeCategory: file.content.attributes[domain_1.FrontMatterAttributes.category],
                    fileName: file.name,
                    maybeType: file.content.attributes[domain_1.FrontMatterAttributes.type]
                }).category,
                type: (0, domain_1.assertCategory)({
                    maybeCategory: file.content.attributes[domain_1.FrontMatterAttributes.category],
                    fileName: file.name,
                    maybeType: file.content.attributes[domain_1.FrontMatterAttributes.type]
                }).type
            };
        };
        this.getAuthors = async (rawAuthorList) => {
            if (!rawAuthorList)
                return;
            const resolveAuthor = async (author) => {
                if (author[0] === "@") {
                    return author.toLowerCase();
                }
                else {
                    // Email address
                    const queriedUser = await infra_1.github.resolveUserByEmail(author);
                    if (!queriedUser)
                        return;
                    return queriedUser.toLowerCase();
                }
            };
            const authors = (0, domain_1.matchAll)(rawAuthorList, domain_1.AUTHOR_RE, 1);
            const resolved = await Promise.all(authors.map(resolveAuthor)).then((res) => res.filter(domain_1.isDefined));
            return new Set(resolved);
        };
    }
}
exports.FileDiffInfra = FileDiffInfra;
//# sourceMappingURL=file_diff_infra.js.map