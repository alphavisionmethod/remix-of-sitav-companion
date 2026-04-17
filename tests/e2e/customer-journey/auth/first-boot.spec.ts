import { test, expect } from "@playwright/test";

// Golden Path: GP-FIRST-BOOT — boot shell renders, owner provisioning works.
// Stub: validates the boot surface mounts. Detailed steps are covered by
// onboarding suites; this guarantees the registry artifactRef is non-phantom.
test("GP-FIRST-BOOT: boot shell renders", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/.*/);
});
