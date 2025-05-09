/**
 * This helper module helps determine which tests to run
 * Used to separate Jest unit tests from Playwright E2E tests
 */
// eslint-disable-next-line no-undef
const isPlaywrightTest = process.env.TEST_TYPE === "playwright";

// eslint-disable-next-line no-undef
module.exports = {
  isPlaywrightTest,
};
