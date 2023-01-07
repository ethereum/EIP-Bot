"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLogs = void 0;
const getLogs = () => {
    return {
        typeCheckingHeader: (type) => {
            console.log(`#### Testing For Type ${type} ####`);
        },
        noMatchingTypes: () => {
            console.log("There were no matching types");
        },
        mustHaveHeader: () => {
            console.log(`-- Testing Must Have --`);
        },
        pathViolation: (path) => {
            console.log(`\t violation: ${path}`);
        },
        mustNotHaveHeader: () => {
            console.log(`-- Testing Must Not Have --`);
        },
        isType: (type) => {
            console.log(`!! is type ${type}`);
        }
    };
};
exports.getLogs = getLogs;
//# sourceMappingURL=logs.js.map