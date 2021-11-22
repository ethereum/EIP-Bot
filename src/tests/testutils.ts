import { Context } from "@actions/github/lib/context";
import actions from "@actions/github";
import { set } from "lodash";
import { PromiseValue } from "type-fest";
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
    throw new Error(
      `function ${fn.toString()} was expected to throw and error but it didn't\n\textra context: ${extraContext}`
    );
};

export const expectErrorWithHandler = async (fn, handler: (error: any) => void, extraContext?: string) => {
  let error;
  try {
    await fn();
  } catch (err) {
    handler && handler(err);
    error = err;
  }
  if (!error)
    throw new Error(
      `function ${fn.toString()} was expected to throw and error but it didn't\n\textra context: ${extraContext}`
    );
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

/**
 * note that there's a bug where if you want to do a promise.then it'll break
 * the types. instead first define it and put it in like mockDependency(.., func, "property")
 */
export const mockDependency = <
  Import extends () => Promise<any>,
  MethodName extends keyof PromiseValue<ReturnType<Import>>,
  ModulePath extends string
>(
  modulePath: ModulePath,
  moduleImport: Import,
  methodName: keyof PromiseValue<ReturnType<Import>>,
  returnValue?: ReturnType<PromiseValue<ReturnType<Import>>[MethodName]>
) => {
  function assertString(maybeString): asserts maybeString is string {
    if (typeof maybeString !== "string") {
      throw Error(
        `method name ${methodName} is not a string but it must be a string`
      );
    }
  }

  type Method = PromiseValue<ReturnType<Import>>[MethodName];
  let methodMock: jest.MockedFunction<Method> = jest.fn();

  beforeAll(async () => {
    jest.mock(modulePath);
    const module = await moduleImport();
    assertString(methodName);
    methodMock = module[methodName];

    const keys = Object.keys(module);
    for (const key of keys) {
      if (key !== methodName) {
        // module[key].mockRestore()
      }
    }
  });

  beforeEach(async () => {
    const mock = await moduleImport();
    methodMock = mock[methodName];
    methodMock.mockReturnValue(returnValue);
  });

  afterEach(async () => {
    const mock = await moduleImport();
    methodMock = mock[methodName];
    methodMock.mockClear();
  });

  afterAll(async () => {
    const mock = await moduleImport();
    methodMock = mock[methodName];
    methodMock.mockRestore();
  });

  return { getMock: () => methodMock };
};

type InputType<T> = T extends (...args: infer Input) => any ? Input : never;
/**
 *  returns a utility to be called within a test; this re-imports the dependency
 *  so that its dependencies are mockable
 */
export const mockedActual = <
  Import extends () => Promise<any>,
  Key extends keyof PromiseValue<ReturnType<Import>>
>(
  importPromise: Import,
  methodName: Key
) => {
  // this is necesary and it's easier to define it here to make sure
  // it's performed
  beforeEach(() => {
    jest.resetModules();
  });
  type Method = PromiseValue<ReturnType<Import>>[Key];
  return async (...args: InputType<Method>): Promise<ReturnType<Method>> => {
    const module = await importPromise();
    const method = module[methodName];
    return method(...args);
  };
};

export const initGeneralTestEnv = () => {
  const restore = MockedEnv(process.env);

  beforeAll(() => {
    if (!nock.isActive()) {
      nock.activate()
    }
    nock.disableNetConnect()
  })

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    nock.cleanAll();
  })

  afterEach(() => {
    restore()
  })

  afterAll(() => {
    jest.restoreAllMocks();
    nock.restore();
    nock.enableNetConnect()
  })
}
