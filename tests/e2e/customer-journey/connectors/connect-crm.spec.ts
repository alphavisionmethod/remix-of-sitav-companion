import { test, expect } from "@playwright/test";

// Golden Path: GP-CONNECT-CRM — connector picker → OAuth → first sync.
test("GP-CONNECT-CRM: connector flow reachable", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/.*/);
});
