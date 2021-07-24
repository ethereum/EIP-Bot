import PR3670 from "./3670";
import PR3596 from "./3596";
import PR3654 from "./3654";

export enum MockedPullNumbers {
  /** editor approval wasn't required if the author of the PR was an editor */
  PR3670 = "3670",
  PR3595 = "3596",
  /** editors weren't mentioned if there was only a valid status error */
  PR3654 = "3654"
}

export default {
  PR3596,
  PR3670,
  PR3654
};
