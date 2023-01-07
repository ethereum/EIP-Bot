"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getType = exports.__Filters__ = void 0;
const domain_1 = require("src/domain");
const new_eip_file_1 = require("#/main/modules/get_type/new_eip_file");
const status_change_1 = require("#/main/modules/get_type/status_change");
const update_eip_1 = require("#/main/modules/get_type/update_eip");
const lodash_1 = __importDefault(require("lodash"));
const utils_1 = require("#/utils");
const logs_1 = require("./logs");
const exceptions_1 = require("src/domain/exceptions");
const Logs = (0, logs_1.getLogs)();
const Filters = {
    [domain_1.ChangeTypes.newEIPFile]: new_eip_file_1.newEIPFile,
    [domain_1.ChangeTypes.statusChange]: status_change_1.statusChange,
    [domain_1.ChangeTypes.updateEIP]: update_eip_1.updateEIP
};
// for tests
exports.__Filters__ = Filters;
const getType = (result) => {
    const results = lodash_1.default.reduce(Filters, function (arr, val, key) {
        Logs.typeCheckingHeader((0, domain_1.isChangeType)(key) ? key : domain_1.ChangeTypes.ambiguous);
        const res = testFilter(val, result);
        if (res) {
            return [...arr, key];
        }
        return arr;
    }, []);
    if (results.length === 1) {
        const type = results[0];
        if ((0, domain_1.isChangeType)(type)) {
            Logs.isType(type);
            return type;
        }
    }
    Logs.noMatchingTypes();
    if (results.length > 2) {
        throw new exceptions_1.UnexpectedError((0, utils_1.multiLineString)(" ")("this change meets the criteria for more than one type, which", `should never happen || [${results.join(", ")}]`));
    }
    // this captures all edgecases
    return domain_1.ChangeTypes.ambiguous;
};
exports.getType = getType;
const testFilter = (filter, result) => {
    const paths = {
        mustNotHave: (0, utils_1.getAllFalseObjectPaths)(filter),
        mustHave: (0, utils_1.getAllTruthyObjectPaths)(filter)
    };
    let violations = {
        mustNotHave: [],
        mustHave: []
    };
    Logs.mustHaveHeader();
    for (const path of paths.mustHave) {
        const value = lodash_1.default.get(result.errors, path);
        if (!(0, domain_1.isDefined)(value)) {
            violations.mustHave.push(path);
            Logs.pathViolation(path);
        }
    }
    Logs.mustNotHaveHeader();
    for (const path of paths.mustNotHave) {
        const value = lodash_1.default.get(result.errors, path);
        if ((0, domain_1.isDefined)(value)) {
            violations.mustNotHave.push(path);
            Logs.pathViolation(path);
        }
    }
    return lodash_1.default.every(lodash_1.default.map(violations, (err) => lodash_1.default.isEmpty(err)));
};
//# sourceMappingURL=index.js.map