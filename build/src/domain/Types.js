"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireMockMethod = exports.NodeEnvs = exports.MockMethods = exports.encodings = void 0;
const exceptions_1 = require("src/domain/exceptions");
exports.encodings = [
    "ascii",
    "utf8",
    "utf-8",
    "utf16le",
    "ucs2",
    "ucs-2",
    "base64",
    "latin1",
    "binary",
    "hex"
];
var MockMethods;
(function (MockMethods) {
    MockMethods["get"] = "GET";
    MockMethods["post"] = "POST";
    MockMethods["patch"] = "PATCH";
    MockMethods["put"] = "PUT";
})(MockMethods = exports.MockMethods || (exports.MockMethods = {}));
var NodeEnvs;
(function (NodeEnvs) {
    NodeEnvs["test"] = "test";
    NodeEnvs["mock"] = "MOCK";
    NodeEnvs["developemnt"] = "development";
    NodeEnvs["production"] = "production";
})(NodeEnvs = exports.NodeEnvs || (exports.NodeEnvs = {}));
function requireMockMethod(method) {
    if (!Object.values(MockMethods).includes(method)) {
        throw new exceptions_1.CriticalError(`method ${method} is not a supported mock method`);
    }
    else {
        return method;
    }
}
exports.requireMockMethod = requireMockMethod;
//# sourceMappingURL=Types.js.map