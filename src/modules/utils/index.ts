import { isDefined, TestResults } from "src/domain";
import _, { intersection, set } from "lodash";

export const OR = (...args: [boolean, ...boolean[]]) => args.includes(true);
export const AND = (...args: [boolean, ...boolean[]]) => !args.includes(false);

export const multiLineString =
  (joinWith = " ") =>
  (...args: [string, ...string[]]) =>
    args.join(joinWith);

export const ANY = (states: any[]) => states.filter(Boolean).length > 0;

/**
 * designed to collect the purified results and return the common paths;
 * this is useful because it means that if one error is purified in one
 * purifier but not in others it will be purified in this step, which
 * avoids race conditions and keeps logic linear and shallow (improves
 * readability)
 *
 * @param parent common ancestor between potentially mutated objects
 * @param objects mutated objects from ancestor
 * @returns common paths of the mutated objects relative to the parent
 */
export const innerJoinAncestors = (
  parent: TestResults,
  objects: TestResults[]
) => {
  const objectPaths = objects.map(getAllTruthyObjectPaths);
  const commonPaths = intersection(...objectPaths);
  const clearPaths = getAllTruthyObjectPaths(parent).filter(
    (path) => !commonPaths.includes(path)
  );

  return clearPaths.reduce(
    (obj, path) => set(obj, path, undefined),
    parent
  ) as TestResults;
};

export const getAllTruthyObjectPaths = (obj: object) => {
  function rKeys(o: object, path?: string) {
    if (!o) return;
    if (typeof o !== "object") return path;
    return Object.keys(o).map((key) =>
      rKeys(o[key], path ? [path, key].join(".") : key)
    );
  }

  return rKeys(obj).toString().split(",").filter(isDefined);
};

export const getAllFalseObjectPaths = (obj: object) => {
  function rKeys(o: object, path?: string) {
    if (typeof o !== "object" || _.isNull(o)) {
      if (o === false) return path;
      return;
    }
    return Object.keys(o).map((key) =>
      rKeys(o[key], path ? [path, key].join(".") : key)
    );
  }

  return rKeys(obj).toString().split(",").filter(isDefined);
};

export const getAllNullObjectPaths = (obj: object) => {
  function rKeys(o: object, path?: string) {
    if (typeof o !== "object") {
      if (_.isNull(o)) return path;
      return;
    }
    return Object.keys(o).map((key) =>
      rKeys(o[key], path ? [path, key].join(".") : key)
    );
  }

  return rKeys(obj).toString().split(",").filter(isDefined);
};
