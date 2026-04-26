// ═══════════════════════════════════════════════════════
// SITA OS — Playwright Global Setup
// Authenticates test user, saves storageState for reuse
// ═══════════════════════════════════════════════════════

import { chromium, FullConfig } from "@playwright/test";
import { TEST_USERS } from "./fixtures/test-users";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

// ESM-safe __dirname (Playwright loads this file as ESM under "type":"module" projects).
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AUTH_STATE_PATH = path.join(__dirname, "../../test-results/.auth/state.json");

async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0]?.use?.baseURL || process.env.PLAYWRIGHT_BASE_URL || "http://localhost:8080";

  // Ensure auth state directory exists
  fs.mkdirSync(path.dirname(AUTH_STATE_PATH), { recursive: true });

  // Verify base URL is reachable
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    const response = await page.goto(baseURL, { timeout: 30000 });
    if (!response || response.status() >= 500) {
      throw new Error(`Base URL ${baseURL} returned status ${response?.status()}`);
    }
    console.log(`✅ Base URL reachable: ${baseURL}`);
  } catch (err) {
    console.error(`❌ Base URL unreachable: ${baseURL}`);
    await browser.close();
    throw err;
  }

  // Authenticate primary test user if credentials exist
  const primary = TEST_USERS.primary;
  if (primary.email && primary.password) {
    try {
      await page.goto(`${baseURL}/login`, { timeout: 15000 });
      await page.locator("input[type='email'], input[placeholder*='email' i]").fill(primary.email);
      await page.locator("input[type='password']").fill(primary.password);
      await page.getByRole("button", { name: /sign in|log in/i }).click();
      await page.waitForURL(/^(?!.*\/(login|signup))/, { timeout: 15000 });
      console.log(`✅ Authenticated as ${primary.email}`);

      // Save storage state for session reuse
      await context.storageState({ path: AUTH_STATE_PATH });
      console.log(`✅ Auth state saved to ${AUTH_STATE_PATH}`);
    } catch (err) {
      console.warn(`⚠️ Auth setup failed — tests requiring auth will skip: ${err}`);
    }
  } else {
    console.warn("⚠️ No TEST_USER_EMAIL/PASSWORD — auth-dependent tests will skip");
  }

  await browser.close();
}

export default globalSetup;
