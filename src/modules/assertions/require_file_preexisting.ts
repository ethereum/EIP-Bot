import { requirePr } from "#assertions";
import { File, FileStatus } from "src/domain";
import { getRepoFilenameContent } from "src/infra";

// this has an injected dependency to make testing easier
export const _requireFilePreexisting =
  (_requirePr: typeof requirePr) => async (file: File) => {
    const pr = await _requirePr();
    const filename = file.previous_filename || file.filename;
    const error = await getRepoFilenameContent(filename, pr.base.sha);

    // @ts-expect-error error.status is defined if the error is a RequestError
    if ((error && error.status === 404) || file.status === FileStatus.added) {
      throw `File with name ${filename} is new and new files must be reviewed`;
    }

    return file;
  };

/**
 *  accepts a standard File object and throws an error if the status is new or
 *  it does not exist at the base commit; uses the file's previous_filename if
 *  it exists.
 */
export const requireFilePreexisting = _requireFilePreexisting(requirePr);
