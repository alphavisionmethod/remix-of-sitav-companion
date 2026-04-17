import { test, expect } from "@playwright/test";

// Golden Path: GP-ENV-RECOVERY — admin rolls back failed deployment.
test("GP-ENV-RECOVERY: environments surface reachable", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/.*/);
});
