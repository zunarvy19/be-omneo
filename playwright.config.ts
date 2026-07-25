import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config();

const baseURL = process.env.BASE_URL || "http://localhost:3000";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: "html",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "api-tests",
      testMatch: /.*\.test\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        baseURL,
      },
    },
  ],
});
