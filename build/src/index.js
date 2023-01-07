"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("module-alias/register");
const main_1 = require("./main");
const domain_1 = require("src/domain");
const debug_1 = require("#/utils/debug");
const mockPR_1 = require("src/tests/assets/mockPR");
const isDebug = process.env.NODE_ENV === domain_1.NodeEnvs.developemnt ||
    process.env.NODE_ENV === domain_1.NodeEnvs.test;
const isMock = process.env.NODE_ENV === domain_1.NodeEnvs.mock;
// allows for easy mocking / testing
if (isMock)
    (0, mockPR_1.__MAIN_MOCK__)();
else if (isDebug)
    (0, debug_1.__MAIN__)();
else
    (0, main_1.main)();
//# sourceMappingURL=index.js.map