import { EVENTS } from "src/domain";
import { getEventName } from "src/infra";
import { CriticalError } from "src/domain/exceptions";

export const requireEvent = () => {
  const event = getEventName();

  const isPullRequestReview = event === EVENTS.pullRequestReview;
  const isPullRequestTarget = event === EVENTS.pullRequestTarget;
  if (!(isPullRequestReview || isPullRequestTarget)) {
    throw new CriticalError(
      `Only events of type ${EVENTS.pullRequestTarget} and ${EVENTS.pullRequestReview} are allowed`
    );
  }

  return event;
};
