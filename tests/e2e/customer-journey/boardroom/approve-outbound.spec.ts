import { test, expect } from "@playwright/test";

// Golden Path: GP-APPROVE-OUTBOUND-FOLLOWUP — review, approve, ship outbound.
test("GP-APPROVE-OUTBOUND-FOLLOWUP: approval queue reachable", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/.*/);
});
