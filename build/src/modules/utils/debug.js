"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setDebugContext = exports.__MAIN__ = void 0;
const Types_1 = require("../../domain/Types");
const exceptions_1 = require("src/domain/exceptions");
const __MAIN__ = async (debugEnv) => {
    const isDebug = process.env.NODE_ENV === Types_1.NodeEnvs.developemnt ||
        process.env.NODE_ENV === Types_1.NodeEnvs.test;
    if (!isDebug)
        throw new exceptions_1.CriticalError("trying to run debug without proper auth");
    // setup debug env
    (0, exports.setDebugContext)(debugEnv);
    // by instantiating after context and env are custom set,
    // it allows for a custom environment that's setup programmatically
    const main = require("src/main").main;
    return await main();
};
exports.__MAIN__ = __MAIN__;
const setDebugContext = (debugEnv) => {
    const env = { ...process.env, ...debugEnv };
    process.env = env;
    // By instantiating after above it allows it to initialize with custom env
    const context = require("@actions/github").context;
    context.payload.pull_request = {
        base: {
            sha: env.BASE_SHA
        },
        head: {
            sha: env.HEAD_SHA
        },
        number: parseInt(env.PULL_NUMBER || "") || 0
    };
    context.payload.repository = {
        // @ts-ignore
        name: env.REPO_NAME,
        owner: {
            key: "",
            // @ts-ignore
            login: env.REPO_OWNER_NAME,
            name: env.REPO_OWNER_NAME
        },
        full_name: `${env.REPO_OWNER}/${env.REPO_NAME}`
    };
    context.eventName = env.EVENT_TYPE;
};
exports.setDebugContext = setDebugContext;
//# sourceMappingURL=debug.js.map