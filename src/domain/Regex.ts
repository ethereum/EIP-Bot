/** matches correctly formatted filenames */
export const FILE_RE = /^EIPS\/eip-(\d+)\.md$/gm;
/** matches authors names formated like (...) */
export const AUTHOR_RE = /[(<]([^>)]+)[>)]/gm;
/** to find the EIP number in a file name */
export const EIP_NUM_RE = /eip-(\d+)\.md/;
/** matches github handles (includes @)*/
export const GITHUB_HANDLE = /^@[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;
/** extracts the eip number of the assets folder associated */
export const ASSETS_EIP_NUM = /(?<=^assets\/eip-)(\d+)(?=\/.*)/;
/** this is used to test if a new file should be considered allowed */
export const FILE_IN_EIP_FOLDER = /^EIPS\/eip-[a-zA-Z]*_.*\.md/

/**
 * This functionality is supported in es2020, but for the purposes
 * of compatibility (and because it's quite simple) it's built explicitly
 */
export const matchAll = (
  rawString: string,
  regex: RegExp,
  group: number
): string[] => {
  let match = regex.exec(rawString);
  let matches: string[] = [];
  while (match != null) {
    const matchedGroup = match[group];
    if (matchedGroup === undefined) continue;
    matches.push(matchedGroup);
    match = regex.exec(rawString);
  }
  return matches;
};
