"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMaintainersString = exports.getUnhandledErrorMessage = exports.tryCatch = exports.isException = exports.processError = exports.CriticalError = exports.GracefulTermination = exports.RequirementViolation = exports.UnexpectedError = exports.Exceptions = void 0;
const utils_1 = require("#/utils");
const lodash_1 = __importDefault(require("lodash"));
const Constants_1 = require("src/domain/Constants");
const typeDeclaratives_1 = require("src/domain/typeDeclaratives");
var Exceptions;
(function (Exceptions) {
    Exceptions["unexpectedError"] = "Unexpected Error";
    Exceptions["requirementViolation"] = "Requirement Violation";
    Exceptions["gracefulTermination"] = "Graceful Termination";
    Exceptions["critical"] = "Critical Error";
    Exceptions["unhandled"] = "Unhandled Exception";
})(Exceptions = exports.Exceptions || (exports.Exceptions = {}));
class UnexpectedError {
    constructor(error = null, data = null) {
        this.error = error;
        this.data = data;
        this.type = "Unexpected Error";
    }
}
exports.UnexpectedError = UnexpectedError;
class RequirementViolation {
    constructor(error = null, data = null) {
        this.error = error;
        this.data = data;
        this.type = "Requirement Violation";
    }
}
exports.RequirementViolation = RequirementViolation;
/**
 *  this terminates the program gracefully, meaning that it will not be treated
 *  as an error. This is useful in cases where an invariant violation does not
 *  necessarily mean that the test fails.
 * */
class GracefulTermination {
    constructor(error = null, data = null) {
        this.error = error;
        this.data = data;
        this.type = "Graceful Termination";
    }
}
exports.GracefulTermination = GracefulTermination;
/**
 * this is used when something happens and the whole program needs to be stopped
 * immediately, it's generally relevant for things like no PR or failed configs
 * */
class CriticalError {
    constructor(error = null, data = null) {
        this.error = error;
        this.data = data;
        this.type = Exceptions.critical;
    }
}
exports.CriticalError = CriticalError;
/**
 * this is written out on purpose to allow for easier changes where necessary
 * it will throw an exception for anything that's not handled
 * */
const processError = (err, { gracefulTermination, unexpectedError, requirementViolation, critical, unhandled }) => {
    if (err?.type === Exceptions.gracefulTermination) {
        if (gracefulTermination)
            return gracefulTermination(err.error, err.data);
    }
    if (err?.type === Exceptions.requirementViolation) {
        if (requirementViolation)
            return requirementViolation(err.error, err.data);
    }
    if (err?.type === Exceptions.unexpectedError) {
        if (unexpectedError)
            return unexpectedError(err.error, err.data);
    }
    if (err?.type === Exceptions.critical) {
        if (critical)
            return critical(err.error, err.data);
    }
    if (unhandled)
        return unhandled(err);
    throw err;
};
exports.processError = processError;
function isException(maybeException) {
    if (!Object.values(Exceptions).includes(maybeException?.type)) {
        // recycles the exception
        return false;
    }
    return true;
}
exports.isException = isException;
/**
 * calls function provided and either returns output directly or it
 * processes the error via the standard exception handler.
 * */
const tryCatch = (func, handlers) => {
    try {
        return func();
    }
    catch (err) {
        return (0, exports.processError)(err, handlers);
    }
};
exports.tryCatch = tryCatch;
/** accepts any error object and then builds a meaningful message */
const getUnhandledErrorMessage = (error) => {
    if (!error) {
        return "a critical and unhandled exception occurred but there was no error";
    }
    let message = new utils_1.MultiLineString(`A critical and unhandled exception has occurred:`);
    const hasErrMessage = (0, utils_1.OR)(!!error.error, !!error.message?.toLowerCase());
    if (hasErrMessage) {
        error.error && message.addLine(`\tMessage: ${error.error}`);
        error.message &&
            message.addLine(`\tMessage: ${error.message?.toLowerCase()}`);
    }
    else {
        message.addLine(`\tMessage: (no error message was provided)`);
    }
    const hasErrData = !(0, utils_1.OR)(lodash_1.default.isNil(error.data), lodash_1.default.isEmpty(error.data));
    if (hasErrData) {
        message.addLine(`\tData:`);
        message.addLine(`${JSON.stringify(error.data, null, 2)}`);
    }
    else {
        message.addLine(`\tData: (there is no data for this error)`);
    }
    const hasNeitherDataNorMessage = !(0, utils_1.OR)(hasErrMessage, hasErrData);
    if (hasNeitherDataNorMessage) {
        message.addLine(`Raw Stringified Error: (doing this because no message or data)`);
        message.addLine(JSON.stringify(error, null, 2));
    }
    return message.message;
};
exports.getUnhandledErrorMessage = getUnhandledErrorMessage;
const getMaintainersString = () => {
    const maintainers = (0, exports.tryCatch)(() => {
        return {
            success: true,
            value: (0, Constants_1.MAINTAINERS)()
        };
    }, {
        critical: (message) => {
            return {
                success: false,
                value: message
            };
        },
        // this will run for any error type other than critical
        unhandled: (error) => {
            return {
                success: false,
                value: (0, exports.getUnhandledErrorMessage)(error)
            };
        }
    });
    if (maintainers.success) {
        (0, typeDeclaratives_1.declareType)(maintainers.value);
        return `(cc ${maintainers.value.join(", ")})`;
    }
    (0, typeDeclaratives_1.declareType)(maintainers.value);
    return (0, utils_1.multiLineString)("\n")(`An error occurred while mentioning maintainers:`, `\t` + maintainers.value);
};
exports.getMaintainersString = getMaintainersString;
//# sourceMappingURL=exceptions.js.map