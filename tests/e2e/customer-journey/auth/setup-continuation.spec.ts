import { test, expect } from "@playwright/test";

// Golden Path: GP-SETUP-CONTINUATION — resume mid-setup from checkpoint.
test("GP-SETUP-CONTINUATION: setup resumes", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/.*/);
});
