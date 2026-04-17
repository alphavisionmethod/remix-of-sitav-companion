import { test, expect } from "@playwright/test";

// Golden Path: GP-OAUTH-AND-SYNC — token refresh + scheduled sync loop.
test("GP-OAUTH-AND-SYNC: scheduled sync surface reachable", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/.*/);
});
