import { multiLineString } from "#/utils";

export const Logs = {
  labelsMatch: (current, expected) => {
    console.log(multiLineString("\n")(
      `The current labels match their expected values`,
      `\t current: [${current.join(", ")}]`,
      `\t expected: [${expected.join(", ")}]`
    ))
  },
  labelsToBeChanged: (current: string[], expected: string[], toAdd: string[], toRemove: string[]) => {
    console.log(multiLineString("\n")(
      `The current labels do not match their expected values, changing...`,
      `\t current: [${current.join(", ")}]`,
      `\t expected: [${expected.join(", ")}]`,
      `\t to be added: [${toAdd.join(", ")}]`,
      `\t to be removed: [${toRemove.join(", ")}]`
    ))
  }
}

export type PullRequestGithubApiLogs = typeof Logs
