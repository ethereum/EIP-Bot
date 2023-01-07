"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logs = void 0;
const utils_1 = require("#/utils");
exports.Logs = {
    labelsMatch: (current, expected) => {
        console.log((0, utils_1.multiLineString)("\n")(`The current labels match their expected values`, `\t current: [${current.join(", ")}]`, `\t expected: [${expected.join(", ")}]`));
    },
    labelsToBeChanged: (current, expected, toAdd, toRemove) => {
        console.log((0, utils_1.multiLineString)("\n")(`The current labels do not match their expected values, changing...`, `\t current: [${current.join(", ")}]`, `\t expected: [${expected.join(", ")}]`, `\t to be added: [${toAdd.join(", ")}]`, `\t to be removed: [${toRemove.join(", ")}]`));
    }
};
//# sourceMappingURL=log.js.map