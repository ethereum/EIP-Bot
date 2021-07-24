import { Context } from "@actions/github/lib/context";
import { set } from "lodash";
import { EipStatus, File, FileDiff, PR } from "src/utils";


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

export const expectError = async (fn) => {
  let error;
  try {
    await fn();
  } catch (err) {
    error = err;
  }
  if (!error)
    throw new Error(
      `function ${fn.toString()} was expected to throw and error but it didn't`
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
