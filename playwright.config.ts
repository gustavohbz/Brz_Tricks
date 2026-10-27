import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    { name: "desktop-chromium", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "tablet-chromium", use: { ...devices["iPad (gen 7)"], defaultBrowserType: "chromium" } },
    { name: "mobile-chromium", use: { ...devices["iPhone 13"], defaultBrowserType: "chromium" } },
    { name: "small-mobile", use: { ...devices["Pixel 7"], defaultBrowserType: "chromium", viewport: { width: 320, height: 640 } } },
    { name: "mobile-landscape", use: { ...devices["iPhone 13"], defaultBrowserType: "chromium", viewport: { width: 844, height: 390 }, isMobile: false } },
  ],
  webServer: {
    command: "pnpm dev --host 127.0.0.1 --port 4173",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
