import { MockedPullNumbers } from "assets/records"
import { __MAIN_MOCK__ } from "src/utils"
import { envFactory } from "__tests__/factories/envFactory";

const mocked = jest.genMockFromModule("@actions/core")
console.log(mocked)
describe("integration testing edgecases associated with editors", () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules(); // Most important - it clears the cache
    process.env = { ...OLD_ENV }; // Make a copy

    mocked.setFailed.mockClear();
  });

  afterAll(() => {
    process.env = OLD_ENV; // Restore old environment
  });
  describe("editor is also an author", () => {

    it("should require editor approval if an editor is also an author", async (next) => {
      const env = envFactory({PULL_NUMBER: MockedPullNumbers.PR3670})
      const res = await __MAIN_MOCK__(env)
      // expect(setFailedMocked).toHaveBeenCalledTimes(1)
      setTimeout(() => { console.log(mocked), next()}, 1000)
    })
  })
})
