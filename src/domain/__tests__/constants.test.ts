import MockedEnv from "mocked-env";
import { envFactory } from "src/tests/factories/envFactory";
import {
  CORE_EDITORS,
  EIPCategory,
  EIPTypeOrCategoryToResolver,
  EIPTypes,
  ERC_EDITORS,
  INFORMATIONAL_EDITORS,
  INTERFACE_EDITORS,
  META_EDITORS,
  NETWORKING_EDITORS
} from "src/domain";
import { expectError } from "src/tests/testutils";

describe("custom editor resolvers (constants)", () => {
  const restore = MockedEnv(process.env);

  afterEach(() => {
    restore();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  const Getters = {
    [EIPCategory.erc]: ERC_EDITORS,
    [EIPCategory.core]: CORE_EDITORS,
    [EIPCategory.interface]: INTERFACE_EDITORS,
    [EIPCategory.networking]: NETWORKING_EDITORS,
    [EIPTypes.meta]: META_EDITORS,
    [EIPTypes.informational]: INFORMATIONAL_EDITORS
  };

  for (const type of Object.keys(Getters)) {
    it(`should parse ${type} eip editors in format @author, @author`, () => {
      process.env = envFactory({
        [EIPTypeOrCategoryToResolver[type]]: "@author1, @author2"
      });
      const res = Getters[type]();
      expect(res).toEqual(["@author1", "@author2"]);
    });

    it(`should throw error if ${type} eip editors are missing @`, async () => {
      process.env = envFactory({
        [EIPTypeOrCategoryToResolver[type]]: "author1, @author2"
      });
      await expectError(() => Getters[type](), `type ${type}`);
    });

    it(`should throw error if ${type} eip editors are missing comma`, async () => {
      process.env = envFactory({
        [EIPTypeOrCategoryToResolver[type]]: "@author1 @author2"
      });
      await expectError(() => Getters[type](), `type ${type}`);
    });

    it(`should throw error if ${type} eip editors are undefined`, async () => {
      process.env = envFactory({
        [EIPTypeOrCategoryToResolver[type]]: undefined
      });
      await expectError(() => Getters[type](), `type ${type}`);
    });

    it(`should parse ${type} eip editors in format @author, @author and any number of spaces`, async () => {
      process.env = envFactory({
        [EIPTypeOrCategoryToResolver[type]]:
          "        @author1,      @author2       "
      });
      const res = Getters[type]();
      expect(res).toEqual(["@author1", "@author2"]);
    });
  }
});
