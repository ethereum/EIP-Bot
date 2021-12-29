import { COMMENT_HEADER, Results } from "src/domain";

export const getCommentMessage = (results: Results, header?: string) => {
  if (!results.length) return "There were no results cc @alita-moore";
  const comment: string[] = [];

  comment.push(header || COMMENT_HEADER);
  comment.push("---");
  for (const { filename, errors, successMessage, type } of results) {
    if (!errors) {
      comment.push(`## (pass) ${filename}`);
      comment.push(`Change Type: ${type}`)
      const message = `- ` + (successMessage || "passed!");
      comment.push(message);
      continue;
    }

    comment.push(`## (fail) ${filename}`);
    for (const error of errors) {
      comment.push(`- ${error}`);
    }
  }
  return comment.join("\n");
};
