export default {
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testMatch: ["**/tests/**/*.test.js"], // look only in tests folder
};
