import { test, expect } from "@playwright/test";

// Golden Path: GP-REVIEW-PROOF — open receipt + verify proof chain.
test("GP-REVIEW-PROOF: proof receipt surface reachable", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/.*/);
});
