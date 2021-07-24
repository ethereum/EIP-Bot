require("module-alias/register");
import { main } from "./main";
import { NodeEnvs, __MAIN__ } from "./utils";
import { __MAIN_MOCK__ } from "assets/mockPR";

const isDebug =
  process.env.NODE_ENV === NodeEnvs.developemnt ||
  process.env.NODE_ENV === NodeEnvs.test;
const isMock = process.env.NODE_ENV === NodeEnvs.mock;

// allows for easy mocking / testing
if (isMock) __MAIN_MOCK__();
else if (isDebug) __MAIN__();
else main();
