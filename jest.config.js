module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: [
    "<rootDir>/src/test/setup.ts",
    "<rootDir>/src/jest-setup.ts",
  ],
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  transform: {
    "^.+\\.(ts|tsx)$": [
      "babel-jest",
      {
        presets: [
          "@babel/preset-env",
          "@babel/preset-react",
          "@babel/preset-typescript",
        ],
      },
    ],
  },
  testMatch: ["**/__tests__/**/*.ts?(x)", "**/?(*.)+(spec|test).ts?(x)"],
  testPathIgnorePatterns: [
    "/node_modules/",
    "/tests/", // Exclude Playwright tests in the tests directory
  ],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/test/**",
    "!src/main.tsx",
    "!src/vite-env.d.ts",
  ],
};
