require("module-alias/register");
import * as core from "@actions/core";
import { main } from "./main";
import { NodeEnvs } from "src/domain";
import { __MAIN__ } from "#/utils/debug";
import { __MAIN_MOCK__ } from "src/tests/assets/mockPR";

const defaultEnv = {
  ERC_EDITORS: core.getInput("ERC_EDITORS"),
  CORE_EDITORS: core.getInput("CORE_EDITORS"),
  NETWORKING_EDITORS: core.getInput("NETWORKING_EDITORS"),
  INTERFACE_EDITORS: core.getInput("INTERFACE_EDITORS"),
  META_EDITORS: core.getInput("META_EDITORS"),
  INFORMATIONAL_EDITORS: core.getInput("INFORMATIONAL_EDITORS"),
  GITHUB_TOKEN: core.getInput("GITHUB-TOKEN"),
  MAINTAINERS: core.getInput("MAINTAINERS"),
  PR_NUMBER: core.getInput("PR_NUMBER"),
  NODE_ENV: "production"
};

for (property in defaultEnv) {
  if (!process.env[property]) {
    process.env[property] = defaultEnv[property];
  }
}

const isDebug =
  process.env.NODE_ENV === NodeEnvs.developemnt ||
  process.env.NODE_ENV === NodeEnvs.test;
const isMock = process.env.NODE_ENV === NodeEnvs.mock;

// allows for easy mocking / testing
if (isMock) __MAIN_MOCK__();
else if (isDebug) __MAIN__();
else main();
