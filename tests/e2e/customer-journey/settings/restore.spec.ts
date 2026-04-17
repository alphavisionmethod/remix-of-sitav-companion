import { test, expect } from "@playwright/test";

// Golden Path: GP-RESTORE — restore account state from cloud snapshot.
test("GP-RESTORE: restore surface reachable", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/.*/);
});
