require("module-alias/register");
import { main } from "./main";
import { __MAIN_MOCK__, __MAIN__ } from "./utils";

const isDebug =
  process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test";
const isMock = process.env.NODE_ENV === "MOCK";

// allows for easy mocking / testing
if (isMock) __MAIN_MOCK__()
else if (isDebug) __MAIN__()
else main()
