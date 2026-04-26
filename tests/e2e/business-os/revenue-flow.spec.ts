// ═══════════════════════════════════════════════════════════════
// Phase 5 — Revenue Flow E2E
// Verifies the operator's main revenue journey:
//   contact → opportunity → quote → proposal → invoice → collections
//
// Honesty discipline:
//   - No live test creds in CI → unauthenticated runs assert auth
//     gating (real ProtectedRoute behavior).
//   - When `TEST_USER_EMAIL` is set, the same spec re-runs the
//     journey behind storageState and asserts each route loads
//     without crash + carries the expected business surface.
//   - We do NOT seed data; we assert the user-visible UI path.
// ═══════════════════════════════════════════════════════════════

import { test, expect } from "@playwright/test";
import { hasTestCredentials } from "../helpers/auth";
import { gotoBusinessRoute, assertBusinessPageLoaded } from "../helpers/business-flow";
import { captureEvidence } from "../helpers/evidence";

const REVENUE_STAGES: Array<{ segment: string; surfaceHint: RegExp }> = [
  { segment: "crm-contacts", surfaceHint: /contact|crm|lead|people/i },
  { segment: "opportunities", surfaceHint: /opportunit|pipeline|deal/i },
  { segment: "quotes", surfaceHint: /quote|estimate|proposal/i },
  { segment: "proposals", surfaceHint: /proposal|signature|sign/i },
  { segment: "invoices", surfaceHint: /invoice|bill|amount|due/i },
  { segment: "collections", surfaceHint: /collection|overdue|recover|outstanding/i },
];

test.describe("Phase 5 — Revenue Flow", () => {
  test("each revenue stage gates unauthenticated traffic", async ({ page }) => {
    for (const stage of REVENUE_STAGES) {
      await page.goto(`/business/${stage.segment}`);
      await page.waitForLoadState("domcontentloaded");
      const url = page.url();
      // Either redirected to /login OR a public auth gate is visible.
      const body = (await page.locator("body").innerText()).toLowerCase();
      const gated =
        url.includes("/login") ||
        body.includes("sign in") ||
        body.includes("log in");
      expect(gated, `${stage.segment} must be auth-gated`).toBe(true);
    }
  });

  test("authenticated revenue journey loads every stage", async ({ page }) => {
    test.skip(!hasTestCredentials(), "requires TEST_USER_EMAIL/PASSWORD");
    for (const stage of REVENUE_STAGES) {
      try {
        await gotoBusinessRoute(page, stage.segment, { timeout: 20000 });
        await assertBusinessPageLoaded(page);
        const text = (await page.locator("body").innerText()).toLowerCase();
        // Truthful surface check — if the page renders an honest empty
        // state ("no contacts yet"), the surface hint still matches.
        expect(text).toMatch(stage.surfaceHint);
      } catch (err) {
        await captureEvidence(page, `revenue-flow-${stage.segment}`);
        throw err;
      }
    }
  });
});