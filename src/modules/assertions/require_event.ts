import { EVENTS } from "src/domain";
import { CriticalError } from "src/domain/exceptions";
import { github } from "src/infra";

export const requireEvent = () => {
  const event = github.getEventName();

  const isPullRequestReview = event === EVENTS.pullRequestReview;
  const isPullRequestTarget = event === EVENTS.pullRequestTarget;
  if (!(isPullRequestReview || isPullRequestTarget)) {
    throw new CriticalError(
      `Only events of type ${EVENTS.pullRequestTarget} and ${EVENTS.pullRequestReview} are allowed`
    );
  }

  return event;
};
