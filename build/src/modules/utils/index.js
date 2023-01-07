"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllNullObjectPaths = exports.getAllFalseObjectPaths = exports.getAllTruthyObjectPaths = exports.innerJoinAncestors = exports.ANY = exports.MultiLineString = exports.multiLineString = exports.AND = exports.OR = void 0;
const domain_1 = require("src/domain");
const lodash_1 = __importStar(require("lodash"));
const OR = (...args) => args.includes(true);
exports.OR = OR;
const AND = (...args) => lodash_1.default.every(args, Boolean);
exports.AND = AND;
const multiLineString = (joinWith = " ") => (...args) => args.filter(domain_1.isDefined).join(joinWith);
exports.multiLineString = multiLineString;
class MultiLineString {
    constructor(initialValue = "") {
        this.message = "";
        this.message = initialValue;
    }
    addLine(line) {
        this.message += `\n${line}`;
    }
}
exports.MultiLineString = MultiLineString;
const ANY = (states) => states.filter(Boolean).length > 0;
exports.ANY = ANY;
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
const innerJoinAncestors = (parent, objects) => {
    const objectPaths = objects.map(exports.getAllTruthyObjectPaths);
    const commonPaths = (0, lodash_1.intersection)(...objectPaths);
    const clearPaths = (0, exports.getAllTruthyObjectPaths)(parent).filter((path) => !commonPaths.includes(path));
    return clearPaths.reduce((obj, path) => (0, lodash_1.set)(obj, path, undefined), parent);
};
exports.innerJoinAncestors = innerJoinAncestors;
const getAllTruthyObjectPaths = (obj) => {
    function rKeys(o, path) {
        if (!o)
            return;
        if (typeof o !== "object")
            return path;
        return Object.keys(o).map((key) => rKeys(o[key], path ? [path, key].join(".") : key));
    }
    return rKeys(obj).toString().split(",").filter(domain_1.isDefined);
};
exports.getAllTruthyObjectPaths = getAllTruthyObjectPaths;
const getAllFalseObjectPaths = (obj) => {
    function rKeys(o, path) {
        if (typeof o !== "object" || lodash_1.default.isNull(o)) {
            if (o === false)
                return path;
            return;
        }
        return Object.keys(o).map((key) => rKeys(o[key], path ? [path, key].join(".") : key));
    }
    return rKeys(obj).toString().split(",").filter(domain_1.isDefined);
};
exports.getAllFalseObjectPaths = getAllFalseObjectPaths;
const getAllNullObjectPaths = (obj) => {
    function rKeys(o, path) {
        if (typeof o !== "object") {
            if (lodash_1.default.isNull(o))
                return path;
            return;
        }
        return Object.keys(o).map((key) => rKeys(o[key], path ? [path, key].join(".") : key));
    }
    return rKeys(obj).toString().split(",").filter(domain_1.isDefined);
};
exports.getAllNullObjectPaths = getAllNullObjectPaths;
//# sourceMappingURL=index.js.map