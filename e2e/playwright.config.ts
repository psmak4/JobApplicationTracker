import { defineConfig, devices } from "@playwright/test";
import path from "path";

// Auth state file path - must match getAuthStatePath() in utils/test-user.ts
const AUTH_STATE_PATH = path.join(__dirname, ".auth", "auth-state.json");

/**
 * Playwright configuration for Job Application Tracker E2E tests.
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./tests",

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Opt out of parallel tests on CI */
  workers: process.env.CI ? 1 : undefined,

  /* Reporter to use */
  reporter: [["html", { open: "never" }], ["list"]],

  /* Shared settings for all projects */
  use: {
    /* Base URL for the UI */
    baseURL: "http://localhost:5173",

    /* Collect trace when retrying a failed test */
    trace: "on-first-retry",

    /* Take screenshot on failure */
    screenshot: "only-on-failure",

    /* Video recording on failure */
    video: "retain-on-failure",
  },

  /* Configure projects */
  projects: [
    /* Setup project - creates test user and saves auth state */
    {
      name: "setup",
      testMatch: /global\.setup\.ts/,
      testDir: ".",
      teardown: "teardown",
    },

    /* Teardown project - cleans up test user */
    {
      name: "teardown",
      testMatch: /global\.teardown\.ts/,
      testDir: ".",
      use: {
        // Use the auth state saved by setup
        storageState: AUTH_STATE_PATH,
      },
    },

    /* Main test project - Chromium only, authenticated */
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // Use the auth state saved by global setup
        storageState: AUTH_STATE_PATH,
      },
      dependencies: ["setup"],
    },
  ],

  /* Run local dev servers before tests */
  webServer: [
    {
      command: "SKIP_EMAIL_VERIFICATION=true npm run dev",
      cwd: "../api",
      url: "http://localhost:4000",
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
    {
      command: "npm run dev",
      cwd: "../ui",
      url: "http://localhost:5173",
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
  ],

  /* Global timeout for tests */
  timeout: 30 * 1000,

  /* Expect timeout */
  expect: {
    timeout: 5 * 1000,
  },
});
