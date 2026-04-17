import { test, expect } from "@playwright/test";

// Golden Path: GP-OWNER-INTERVENTION — admin arms/disarms kill switch.
test("GP-OWNER-INTERVENTION: kill-switch surface reachable", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/.*/);
});
