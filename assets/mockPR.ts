import nock from "nock"
import { PR } from "src/utils";
import PRs from "./pulls"

const scope = nock("https://api.github.com").persist();

/**
 * This is a tool used to mock pull requests, this is useful for testing and it's also
 * useful for development. It makes dealing with merged PRs trivial because if you change
 * the mocked requests in its respective asset file then you can simulate situations
 *
 * @param pullNumber the pull number to mock (mocks the necesary github api requests)
 * @returns mocked pull request of the pull number
 */
export const mockPR = (pullNumber: number) => {
  const records = PRs[`PR${pullNumber}`]
  const requests = Object.keys(records);

  for (const request of requests) {
    console.log("mocking request ||", request)
    scope.get(request).reply(200, records[request])
  }

  nock.disableNetConnect()
  return records[`/repos/ethereum/EIPs/pulls/${pullNumber}`] as PR
}
