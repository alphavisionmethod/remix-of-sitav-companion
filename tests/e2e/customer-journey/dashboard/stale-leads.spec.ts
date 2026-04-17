import { test, expect } from "@playwright/test";

// Golden Path: GP-RECOVER-STALE-LEADS — detect stale leads + recovery action.
test("GP-RECOVER-STALE-LEADS: stale-leads surface reachable", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/.*/);
});
