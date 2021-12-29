import { __Filters__, getType } from "#/main/get_type";
import _ from "lodash";
import __ from "underscore";
import { testResultsFactory } from "src/tests/factories/testResultsFactory";
import { convertTrueToStringOnLeafs } from "src/tests/testutils";
import { ChangeTypes } from "src/domain";
import { getAllTruthyObjectPaths } from "#/utils";

const Filters = _.mapValues(__Filters__, (val) => {
  return convertTrueToStringOnLeafs(val)
})

describe("getType", () => {
  it("should return status change if matching errors", () => {
    const results = testResultsFactory({
      errors: Filters.statusChange
    })

    const res = getType(results);
    expect(res).toBe(ChangeTypes.statusChange);
  })

  it("should return new eip file if matching errors", () => {
    const results = testResultsFactory({
      errors: Filters.newEIPFile
    })

    const res = getType(results);
    expect(res).toBe(ChangeTypes.newEIPFile);
  })

  it("should return update eip if matching errors", () => {
    const results = testResultsFactory({
      errors: Filters.updateEIP
    })

    const res = getType(results);
    expect(res).toBe(ChangeTypes.updateEIP);
  })

  it("should return ambiguous if none match", () => {
    const results = testResultsFactory({
      errors: _.merge(Filters.newEIPFile, Filters.statusChange)
    })

    const res = getType(results);
    expect(res).toBe(ChangeTypes.ambiguous);
  })
})

describe("type definitions", () => {
  // A and B are valid if at least one must have matches with a must not
  const combinations =
    Object.keys(__Filters__).flatMap((first, i, arr) => {
      return arr.slice(i+1).flatMap(second => {
        return [[first, second], [second, first]] as [ChangeTypes, ChangeTypes][]
      })
    })

  for (const combo of combinations) {
    test(`combo ${combo.join(' => ')} should be valid`, () => {
      const A = __Filters__[combo[0]];
      const B = __Filters__[combo[1]];
      const paths = getAllTruthyObjectPaths(A);
      for (const path of paths) {
        // if one is true and other false, they cannot coincide
        expect(_.get(B, path)).toBe(false)
      }
    })
  }
})
