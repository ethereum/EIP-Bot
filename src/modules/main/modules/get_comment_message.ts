import { COMMENT_HEADER, Results } from "src/domain";

export const getCommentMessage = (results: Results, header?: string) => {
  if (!results.length) return "There were no results cc @alita-moore";
  const comment: string[] = [];

  comment.push(header || COMMENT_HEADER);
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
