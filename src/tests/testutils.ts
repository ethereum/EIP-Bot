import { Context } from "@actions/github/lib/context";
import actions from "@actions/github";
import { set } from "lodash";
import nock from "nock";
import MockedEnv from "mocked-env";

export const getAllTruthyObjectPaths = (obj: object) => {
  function rKeys(o: object, path?: string) {
    if (!o) return;
    if (typeof o === "function") return;
    if (typeof o !== "object") return path;
    return Object.keys(o).map((key) =>
      rKeys(o[key], path ? [path, key].join(".") : key)
    );
  }

  return rKeys(obj).toString().split(",").filter(Boolean) as string[];
};

export const expectError = async (fn, extraContext?: string) => {
  let error;
  try {
    await fn();
  } catch (err) {
    error = err;
  }
  if (!error)
    throw `function ${fn.toString()} was expected to throw and error but it didn't\n\textra context: ${extraContext}`;
};

export const expectErrorWithHandler = async (
  fn,
  handler: (error: any) => void,
  extraContext?: string
) => {
  let error;
  try {
    await fn();
  } catch (err) {
    handler && handler(err);
    error = err;
  }
  if (!error)
    throw `function ${fn.toString()} was expected to throw and error but it didn't\n\textra context: ${extraContext}`;
};

export const clearContext = (context: Context) => {
  const paths = getAllTruthyObjectPaths(context);
  for (const path of paths) {
    set(context, path, undefined);
  }
};

export type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends {} ? RecursivePartial<T[P]> : T[P];
};

/** a utility that helps simplify mocking github context */
export const mockGithubContext = (
  defaultContext: Partial<typeof actions["context"]> = {},
  getOctokit = () => {}
) => {
  beforeAll(() => {
    jest.mock("@actions/github", () => ({
      context: {},
      getOctokit: jest.fn()
    }));
  });

  let mock: jest.Mocked<typeof actions>;
  beforeEach(async () => {
    mock = (await import("@actions/github")) as any;
    mock.getOctokit.mockImplementation(getOctokit as any);

    // this is a typescript workaround for redefining const values
    const mocked = mock as { context: {} };
    mocked.context = defaultContext;
  });

  afterEach(() => {
    clearContext(mock.context);
    mock.getOctokit.mockClear();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  // initially returned value gets stale
  const getMock = () => mock;

  return getMock;
};

export const initGeneralTestEnv = () => {
  const restore = MockedEnv(process.env);

  beforeAll(() => {
    if (!nock.isActive()) {
      nock.activate();
    }
    nock.disableNetConnect();
  });

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    nock.cleanAll();
  });

  afterEach(() => {
    restore();
  });

  afterAll(() => {
    jest.restoreAllMocks();
    nock.restore();
    nock.enableNetConnect();
  });
};
