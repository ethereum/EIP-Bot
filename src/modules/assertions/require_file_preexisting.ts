import { ContentData, File, FileStatus, isDefined, PR } from "src/domain";
import {
  IRequireFilePreexisting,
  PreexistingFile
} from "#/assertions/Domain/types";
import { RequirementViolation, UnexpectedError } from "src/domain/exceptions";
import { multiLineString } from "#/utils";

export class RequireFilePreexisting implements IRequireFilePreexisting {
  constructor(
    public requirePr: () => Promise<PR>,
    public getRepoFilenameContent: (
      filename: string,
      sha: string
    ) => Promise<ContentData>
  ) {}

  /**
   *  accepts a standard File object and throws an error if the status is new or
   *  it does not exist at the base commit; uses the file's previous_filename if
   *  it exists.
   */
  async requireFilePreexisting(file: File): Promise<PreexistingFile> {
    const pr = await this.requirePr();
    const filename = file.previous_filename || file.filename;

    if (!isDefined(filename)) {
      throw new UnexpectedError(
        multiLineString(" ")(
          `the file did not have a previous or current`,
          `filename associated with it`
        ),
        {
          pr,
          file
        }
      );
    }

    const error = await this.getRepoFilenameContent(
      filename,
      pr.base.sha
    ).catch((err) => err);

    if (
      (isDefined(error) && error.status === 404) ||
      file.status === FileStatus.added
    ) {
      throw new RequirementViolation(
        multiLineString(" ")(
          `File with name ${filename} is new and new files must be reviewed`
        )
      );
    }

    return file as PreexistingFile;
  }
}
