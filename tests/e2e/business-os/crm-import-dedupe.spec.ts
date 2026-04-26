// ═══════════════════════════════════════════════════════════════
// Phase 5 — CRM Import + Dedupe E2E
//   /business/crm-import → import flow surface
//   /business/crm-duplicates → dedupe queue surface
// ═══════════════════════════════════════════════════════════════

import { test, expect } from "@playwright/test";
import { hasTestCredentials } from "../helpers/auth";
import { gotoBusinessRoute, assertBusinessPageLoaded } from "../helpers/business-flow";

test.describe("Phase 5 — CRM Import & Dedupe", () => {
  test("import + duplicates routes auth-gate unauthenticated traffic", async ({ page }) => {
    for (const seg of ["crm-import", "crm-duplicates"]) {
      await page.goto(`/business/${seg}`);
      await page.waitForLoadState("domcontentloaded");
      const body = (await page.locator("body").innerText()).toLowerCase();
      expect(
        page.url().includes("/login") ||
          body.includes("sign in") ||
          body.includes("log in"),
      ).toBe(true);
    }
  });

  test("authenticated import surface renders with honest controls", async ({ page }) => {
    test.skip(!hasTestCredentials(), "requires TEST_USER_EMAIL/PASSWORD");
    await gotoBusinessRoute(page, "crm-import");
    await assertBusinessPageLoaded(page);
    const text = (await page.locator("body").innerText()).toLowerCase();
    expect(text).toMatch(/import|csv|upload|file|map/);
  });

  test("authenticated duplicates surface renders dedupe queue or empty state", async ({ page }) => {
    test.skip(!hasTestCredentials(), "requires TEST_USER_EMAIL/PASSWORD");
    await gotoBusinessRoute(page, "crm-duplicates");
    await assertBusinessPageLoaded(page);
    const text = (await page.locator("body").innerText()).toLowerCase();
    expect(text).toMatch(/duplicate|merge|dedup|no .* yet|nothing|empty/);
  });
});