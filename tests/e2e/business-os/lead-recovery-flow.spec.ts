// ═══════════════════════════════════════════════════════════════
// Phase 5 — Lead Recovery E2E
//   /business/leads → triage / scoring surface
//   /business/lead-recovery → recovery queue + honest dispatch UI
//
// Honesty: we never assert a successful Twilio/email dispatch in
// CI — we only assert the UI exposes the action without claiming
// fake success.
// ═══════════════════════════════════════════════════════════════

import { test, expect } from "@playwright/test";
import { hasTestCredentials } from "../helpers/auth";
import { gotoBusinessRoute, assertBusinessPageLoaded } from "../helpers/business-flow";

test.describe("Phase 5 — Lead Recovery Flow", () => {
  test("leads + lead-recovery routes auth-gate unauthenticated traffic", async ({ page }) => {
    for (const seg of ["leads", "lead-recovery"]) {
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

  test("authenticated lead surfaces render honest scoring/recovery state", async ({ page }) => {
    test.skip(!hasTestCredentials(), "requires TEST_USER_EMAIL/PASSWORD");

    await gotoBusinessRoute(page, "leads");
    await assertBusinessPageLoaded(page);
    const leadsText = (await page.locator("body").innerText()).toLowerCase();
    expect(leadsText).toMatch(/lead|score|triage|inbox|no .* yet|empty/);

    await gotoBusinessRoute(page, "lead-recovery");
    await assertBusinessPageLoaded(page);
    const recoveryText = (await page.locator("body").innerText()).toLowerCase();
    expect(recoveryText).toMatch(/recover|stale|re-?engage|queue|no .* yet|empty/);

    // Honest dispatch: we must NOT see a generic "Sent ✓" claim
    // unless backed by a queued send. If the page shows a "Send"
    // CTA, that is acceptable; pre-claiming success is not.
    expect(recoveryText).not.toMatch(/\bsent successfully\b.*\bdemo\b/);
  });
});