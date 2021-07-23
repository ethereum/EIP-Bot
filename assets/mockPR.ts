import nock from "nock";
import { PR } from "src/utils";
import MockRecords from "./records";

const baseUrl = "https://api.github.com";
const scope = nock(baseUrl).persist();

/**
 * This is a tool used to mock pull requests, this is useful for testing and it's also
 * useful for development. It makes dealing with merged PRs trivial because if you change
 * the mocked requests in its respective asset file then you can simulate situations
 *
 * @param pullNumber the pull number to mock (mocks the necesary github api requests)
 * @returns mocked pull request of the pull number
 */
export const mockPR = (pullNumber: number) => {
  const records = MockRecords[`PR${pullNumber}`];

  if (!records) throw new Error(`no mocked records for pull number ${pullNumber}`)
  for (const record of records) {
    const req = record.req;
    const res = record.res;
    const wildcard = req.url.replace(baseUrl, "");

    switch (req.method) {
      case "GET":
        scope.get(wildcard).reply(res.status, res.data);
      case "POST":
        scope.post(wildcard).reply(res.status, res.data);
    }
  }

  nock.disableNetConnect();

  const PRWildcard = `/repos/ethereum/EIPs/pulls/${pullNumber}`;
  return records.find(
    (record) =>
      record.req.method === "GET" &&
      record.req.url === `${baseUrl}${PRWildcard}`
  ).res.data as PR;
};
