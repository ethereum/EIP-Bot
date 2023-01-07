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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setMockContext = exports.__MAIN_MOCK__ = exports.mockPR = void 0;
const github_1 = require("@actions/github");
const nock_1 = __importDefault(require("nock"));
const domain_1 = require("src/domain");
const records_1 = require("./records");
const fs = __importStar(require("fs"));
const exceptions_1 = require("src/domain/exceptions");
const HttpStatus = __importStar(require("http-status"));
const baseUrl = "https://api.github.com";
const scope = (0, nock_1.default)(baseUrl).persist();
/**
 * This is a tool used to mock pull requests, this is useful for testing and it's also
 * useful for development. It makes dealing with merged PRs trivial because if you change
 * the mocked requests in its respective asset file then you can simulate situations
 *
 * @param pullNumber the pull number to mock (mocks the necesary github api requests)
 * @returns mocked pull request of the pull number
 */
const mockPR = async (pullNumber) => {
    const mockRecords = await (0, records_1.getMockRecords)();
    const records = mockRecords[`PR${pullNumber}`];
    if (!records)
        throw new exceptions_1.CriticalError(`no mocked records for pull number ${pullNumber}`);
    for (const record of records) {
        const req = record.req;
        const res = record.res;
        if (!req && !res)
            continue; // allows for setting {} for new mocks
        const wildcard = req.url.replace(baseUrl, "");
        switch (req.method) {
            case "GET":
                scope.get(wildcard).reply(res.status, res.data);
                break;
            case "POST":
                scope.post(wildcard).reply(res.status, res.data);
                break;
            case "PATCH":
                scope.patch(wildcard).reply(res.status, res.data);
                break;
            case domain_1.MockMethods.put:
                scope.put(wildcard).reply(res.status, res.data);
                break;
        }
    }
    nock_1.default.disableNetConnect();
    const PRWildcard = `/repos/ethereum/EIPs/pulls/${pullNumber}`;
    return records.find((record) => record.req?.method === "GET" &&
        record.req?.url === `${baseUrl}${PRWildcard}`)?.res?.data;
};
exports.mockPR = mockPR;
// TODO: rename and reorganize these debugging tools
const __MAIN_MOCK__ = async (mockEnv) => {
    const isMock = process.env.NODE_ENV === domain_1.NodeEnvs.mock ||
        process.env.NODE_ENV === domain_1.NodeEnvs.test;
    if (!isMock)
        throw new exceptions_1.CriticalError("trying to run debug without proper auth");
    // setup debug env
    await (0, exports.setMockContext)(mockEnv);
    // by instantiating after context and env are custom set,
    // it allows for a custom environment that's setup programmatically
    const main = (await Promise.resolve().then(() => __importStar(require("src/main")))).main;
    // only want to run this once to make things easier
    try {
        return await main();
    }
    catch (err) {
        const url = err?.request?.url;
        const method = err?.request?.method;
        const body = err?.request?.body;
        console.log(err.type);
        if (url && method) {
            await fetchAndCreateRecord(url, method, body);
        }
        else {
            throw err;
        }
    }
};
exports.__MAIN_MOCK__ = __MAIN_MOCK__;
const setMockContext = async (mockEnv) => {
    const env = { ...process.env, ...mockEnv };
    process.env = env;
    if (!env.PULL_NUMBER)
        throw new exceptions_1.CriticalError("PULL_NUMBER is required to mock");
    // setup saved record (mocking network responses)
    (0, records_1.assertSavedRecord)(env.PULL_NUMBER);
    const pr = await (0, exports.mockPR)(env.PULL_NUMBER);
    // By instantiating after above it allows it to initialize with custom env
    const context = (await Promise.resolve().then(() => __importStar(require("@actions/github")))).context;
    context.payload.pull_request = {
        base: {
            sha: pr?.base?.sha
        },
        head: {
            sha: pr?.head?.sha
        },
        number: parseInt(env.PULL_NUMBER || "") || 0
    };
    // context.issue.number = pr.number
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
    // @ts-ignore
    context.eventName = env.EVENT_TYPE;
};
exports.setMockContext = setMockContext;
const fetchAndCreateRecord = async (url, method, body) => {
    console.error("failed request", method, url, "\nmocking request...");
    const isMock = process.env.NODE_ENV === domain_1.NodeEnvs.mock;
    if (!isMock)
        return;
    nock_1.default.cleanAll();
    nock_1.default.enableNetConnect();
    const github = (0, github_1.getOctokit)(domain_1.GITHUB_TOKEN).request;
    const res = await github({
        method,
        url,
        ...JSON.parse(body || "{}")
    }).catch((err) => {
        nock_1.default.disableNetConnect();
        return err;
    });
    console.log("successfully fetched data");
    nock_1.default.disableNetConnect();
    const fileName = `records/${process.env.PULL_NUMBER?.replace("_", "/")}.json`;
    const mockedRecord = (await Promise.resolve().then(() => __importStar(require("./" + fileName)))).default;
    (0, domain_1.requireMockMethod)(method);
    const handleResData = (res) => {
        const status = res.status;
        if ([HttpStatus.OK, HttpStatus.CREATED].includes(status)) {
            // when successful it returns the response in a res.data format
            return res.data;
        }
        if ([HttpStatus.NOT_FOUND].includes(status)) {
            // when it returns a not found or other types of failures
            return res.response.data;
        }
        throw new exceptions_1.UnexpectedError(`status code ${status} is not a handled status`);
    };
    mockedRecord.push({
        req: {
            url,
            method
        },
        res: {
            status: res.status,
            data: handleResData(res)
        }
    });
    console.log(process.cwd() + "/src/tests/assets/" + fileName);
    fs.writeFile(process.cwd() + "/src/tests/assets/" + fileName, JSON.stringify(mockedRecord, null, 2), () => {
        console.log(mockedRecord);
        console.log("wrote file");
    });
};
//# sourceMappingURL=mockPR.js.map