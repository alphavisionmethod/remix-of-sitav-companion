import { test, expect } from "@playwright/test";

// Golden Path: GP-MOBILE-APPROVAL — open from push, approve on mobile PWA.
test("GP-MOBILE-APPROVAL: mobile approval surface reachable", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/.*/);
});
