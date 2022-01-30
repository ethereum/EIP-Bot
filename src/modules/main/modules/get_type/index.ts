import {
  ChangeTypes,
  ERRORS_TYPE_FILTER,
  isChangeType,
  isDefined,
  TestResults
} from "src/domain";
import { newEIPFile } from "#/main/modules/get_type/new_eip_file";
import { statusChange } from "#/main/modules/get_type/status_change";
import { updateEIP } from "#/main/modules/get_type/update_eip";
import _ from "lodash";
import {
  getAllFalseObjectPaths,
  getAllTruthyObjectPaths,
  multiLineString
} from "#/utils";
import { getLogs } from "./logs";
import { UnexpectedError } from "src/domain/exceptions";

const Logs = getLogs();

const Filters = {
  [ChangeTypes.newEIPFile]: newEIPFile,
  [ChangeTypes.statusChange]: statusChange,
  [ChangeTypes.updateEIP]: updateEIP
};

// for tests
export const __Filters__ = Filters;

export const getType = (result: TestResults): ChangeTypes => {
  const results = _.reduce(
    Filters,
    function (arr, val, key) {
      Logs.typeCheckingHeader(isChangeType(key) ? key : ChangeTypes.ambiguous);
      const res = testFilter(val, result);
      if (res) {
        return [...arr, key];
      }
      return arr;
    },
    [] as string[]
  );

  if (results.length === 1) {
    const type = results[0]!;
    if (isChangeType(type)) {
      Logs.isType(type);
      return type;
    }
  }
  Logs.noMatchingTypes();

  if (results.length > 2) {
    throw new UnexpectedError(
      multiLineString(" ")(
        "this change meets the criteria for more than one type, which",
        `should never happen || [${results.join(", ")}]`
      )
    );
  }

  // this captures all edgecases
  return ChangeTypes.ambiguous;
};

const testFilter = (
  filter: ERRORS_TYPE_FILTER,
  result: TestResults
): boolean => {
  const paths = {
    mustNotHave: getAllFalseObjectPaths(filter),
    mustHave: getAllTruthyObjectPaths(filter)
  };

  let violations = {
    mustNotHave: [] as string[],
    mustHave: [] as string[]
  };

  Logs.mustHaveHeader();
  for (const path of paths.mustHave) {
    const value = _.get(result.errors, path);

    if (!isDefined(value)) {
      violations.mustHave.push(path);
      Logs.pathViolation(path);
    }
  }

  Logs.mustNotHaveHeader();
  for (const path of paths.mustNotHave) {
    const value = _.get(result.errors, path);

    if (isDefined(value)) {
      violations.mustNotHave.push(path);
      Logs.pathViolation(path);
    }
  }

  return _.every(_.map(violations, (err) => _.isEmpty(err)));
};
