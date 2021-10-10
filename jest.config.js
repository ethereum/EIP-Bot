/*
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/en/configuration.html
 */

module.exports = {
  clearMocks: true,
  moduleDirectories: [
    "node_modules",
    "./"
  ],
  moduleNameMapper: {
      "#domain": "<rootDir>/src/domain",
      "#assertions": "<rootDir>/src/modules/assertions",
      "#infra": "<rootDir>/src/infra",
      "#components": "<rootDir>/src/modules/components",
      "#approvals": "<rootDir>/src/modules/approvals",
      "#file": "<rootDir>/src/modules/file"
  },
  testEnvironment: "node",
  testMatch: [
    // "**/__tests__/**/*.[jt]s?(x)",
    "**/?(*.)+(spec|test).[tj]s?(x)"
  ]
};
