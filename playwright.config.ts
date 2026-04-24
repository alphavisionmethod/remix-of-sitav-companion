import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 3 : 1,
  workers: process.env.CI ? 1 : undefined,
  globalSetup: "./tests/e2e/global.setup.ts",
  globalTeardown: "./tests/e2e/global.teardown.ts",
  reporter: [
    ["html", { open: "never" }],
    ["list"],
    ["./tests/e2e/reporters/journey-reporter.ts", { outputDir: "test-results/journey-reports" }],
  ],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:8080",
    trace: "retain-on-failure",
    screenshot: "on",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "customer-journey",
      testDir: "./tests/e2e/customer-journey",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "consolidation-regression",
      testMatch: "consolidation-wave-regression.spec.ts",
      use: {
        ...devices["Desktop Chrome"],
        navigationTimeout: 20_000,
        actionTimeout: 15_000,
      },
      timeout: 60_000,
      retries: 2,
    },
    {
      name: "visual-regression",
      testMatch: "visual-regression-panels.spec.ts",
      use: {
        ...devices["Desktop Chrome"],
      },
      timeout: 60_000,
      retries: 0,
    },
    {
      name: "edge-contracts",
      testMatch: "edge-function-contracts.spec.ts",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "kill-switch-drill",
      testMatch: "kill-switch-drill.spec.ts",
      use: { ...devices["Desktop Chrome"] },
      timeout: 120_000,
      retries: 0,
    },
  ],
  webServer: process.env.CI
    ? undefined
    : {
        command: "npm run dev",
        url: "http://localhost:8080",
        reuseExistingServer: true,
        timeout: 30000,
      },
});
