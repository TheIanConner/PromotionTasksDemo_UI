import "@testing-library/jest-dom";
import "@testing-library/jest-dom/jest-globals";
import { cleanup } from "@testing-library/react";

// Clean up after each test case
afterEach(() => {
  cleanup();
});
