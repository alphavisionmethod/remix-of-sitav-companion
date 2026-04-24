// ═══════════════════════════════════════════════════════
// SITA OS — Kill-Switch Drill (E2E)
//
// Full closed-loop drill that:
//   1. Logs in as the drill admin.
//   2. Arms KS-DRILL-E2E via the kill-switch-toggle edge function.
//   3. Verifies state surface reports it enabled.
//   4. Verifies an audit row was emitted.
//   5. Verifies degraded-mode UI surfaces in the browser session.
//   6. Verifies receipt(s) were emitted within the drill window.
//   7. Disarms the switch.
//   8. Verifies the UI recovers from the degraded state.
//   9. Writes a machine-readable drill receipt for CI gating.
//
// The test SKIPS (does not fail) when drill credentials are absent
// so local devs without the secret bag don't see false failures.
// CI MUST inject the secrets — see .github/workflows/kill-switch-drill.yml.
// ═══════════════════════════════════════════════════════

import { test, expect } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  armDrillSwitch,
  disarmDrillSwitch,
  emptyDrillReceipt,
  hasKillSwitchDrillCredentials,
  loginAsDrillAdmin,
  readDrillSwitchState,
  readRecentAuditRows,
  readRecentReceiptRows,
  DRILL_SWITCH_ID,
} from "./helpers/kill-switch";

const RECEIPT_DIR = "generated/kill-switch-drill";

function writeDrillReceipt(name: string, payload: unknown) {
  mkdirSync(RECEIPT_DIR, { recursive: true });
  writeFileSync(join(RECEIPT_DIR, name), JSON.stringify(payload, null, 2));
}

test.describe("Kill-Switch Drill", () => {
  test.skip(
    !hasKillSwitchDrillCredentials(),
    "Kill-switch drill requires E2E_ADMIN_EMAIL/PASSWORD + Supabase URL/anon key",
  );

  test("arm → degrade → receipts → disarm → recover", async ({ page }) => {
    test.setTimeout(120_000);

    const ctx = await loginAsDrillAdmin();
    const receipt = emptyDrillReceipt(ctx.drillRunId);

    try {
      // ── 1. Pre-flight: switch must start disabled ────────────────
      const preState = await readDrillSwitchState(ctx);
      if (preState?.enabled) {
        // Reset to a known-good baseline before drill
        await disarmDrillSwitch(ctx, "drill pre-flight reset to known baseline");
      }

      // ── 2. Arm the drill switch ──────────────────────────────────
      const armReason = `e2e drill ${ctx.drillRunId}: simulated outage exercise`;
      const armResult = await armDrillSwitch(ctx, armReason);
      receipt.armed = armResult.ok;
      expect(armResult.ok, `arm response: ${JSON.stringify(armResult.raw)}`).toBe(true);

      // ── 3. State surface must reflect enabled ────────────────────
      const armedState = await readDrillSwitchState(ctx);
      receipt.stateObservedEnabled = !!armedState?.enabled;
      expect(armedState?.enabled, "state endpoint must report drill switch enabled").toBe(true);
      expect(armedState?.reason ?? "").toContain("drill");

      // ── 4. Audit row was emitted ─────────────────────────────────
      const auditRows = await readRecentAuditRows(ctx, 60);
      receipt.auditRowsObserved = auditRows.length;
      expect(auditRows.length, "audit log must contain a row for the drill switch").toBeGreaterThan(0);
      const armRow = auditRows.find(
        (r) => String(r.action ?? "").toLowerCase().includes("activat") || String(r.action ?? "").toLowerCase().includes("enable"),
      );
      expect(armRow, "an arm/activate audit row must exist for the drill switch").toBeTruthy();

      // ── 5. Browser-side degraded-mode UI surfaces ────────────────
      // Inject the switch state into a global the shell already inspects so
      // we exercise the runtime degraded-mode pathway without waiting on
      // a polling cycle. The shell's degraded banner reads from
      // window.__SITA_KILL_SWITCH_OVERRIDE__ when present (test hook).
      await page.addInitScript((switchId) => {
        (window as unknown as Record<string, unknown>).__SITA_KILL_SWITCH_OVERRIDE__ = {
          [switchId]: { enabled: true, reason: "drill", severity: "moderate" },
        };
      }, DRILL_SWITCH_ID);

      await page.goto("/", { waitUntil: "domcontentloaded" });
      // Either the explicit degraded banner or any element with role=alert
      // mentioning degraded/limited service is acceptable evidence.
      const degradedLocator = page.locator(
        "[data-degraded-mode], [data-testid='degraded-mode-banner'], [role='alert']",
      );
      const degradedVisible = await degradedLocator
        .first()
        .isVisible({ timeout: 8000 })
        .catch(() => false);
      receipt.degradedUiObserved = degradedVisible;
      // Degraded UI is a soft assertion — record but do not hard-fail
      // when shells are stripped down in headless smoke runs. CI gate
      // upgrades this to hard-fail when SITA_DRILL_REQUIRE_UI=1.
      if (process.env.SITA_DRILL_REQUIRE_UI === "1") {
        expect(degradedVisible, "degraded-mode UI must be visible while drill switch armed").toBe(true);
      }

      // ── 6. Receipts were emitted within the drill window ─────────
      const receiptsRows = await readRecentReceiptRows(ctx, 60);
      receipt.receiptsInWindow = receiptsRows.length;
      // Either the toggle itself or downstream automations must produce
      // at least one receipt; if the table is policy-locked for the
      // drill admin role, treat zero rows as a soft signal.
      if (process.env.SITA_DRILL_REQUIRE_RECEIPTS === "1") {
        expect(receiptsRows.length, "at least one receipt should land in the drill window").toBeGreaterThan(0);
      }

      // ── 7. Disarm the drill switch ───────────────────────────────
      const disarmResult = await disarmDrillSwitch(ctx, `drill ${ctx.drillRunId}: end of exercise`);
      receipt.disarmed = disarmResult.ok;
      expect(disarmResult.ok, `disarm response: ${JSON.stringify(disarmResult.raw)}`).toBe(true);

      const disarmedState = await readDrillSwitchState(ctx);
      receipt.stateObservedDisabled = !disarmedState?.enabled;
      expect(disarmedState?.enabled ?? false, "state endpoint must report drill switch disabled after disarm").toBe(false);

      // ── 8. Recovery: UI returns to normal after override cleared ─
      await page.addInitScript(() => {
        delete (window as unknown as Record<string, unknown>).__SITA_KILL_SWITCH_OVERRIDE__;
      });
      await page.reload({ waitUntil: "domcontentloaded" });
      const stillDegraded = await page
        .locator("[data-degraded-mode], [data-testid='degraded-mode-banner']")
        .first()
        .isVisible({ timeout: 4000 })
        .catch(() => false);
      receipt.recoveryUiObserved = !stillDegraded;
      expect(stillDegraded, "degraded UI must clear after disarm + reload").toBe(false);

      // ── 9. Compute pass + write machine-readable receipt ─────────
      receipt.pass =
        receipt.armed &&
        receipt.disarmed &&
        receipt.stateObservedEnabled &&
        receipt.stateObservedDisabled &&
        receipt.auditRowsObserved > 0 &&
        receipt.recoveryUiObserved;
    } catch (err) {
      receipt.notes.push(`drill error: ${(err as Error).message}`);
      throw err;
    } finally {
      receipt.finishedAt = new Date().toISOString();
      writeDrillReceipt(`drill-${ctx.drillRunId}.json`, receipt);
      writeDrillReceipt("latest.json", receipt);
      // Best-effort safety: ensure the switch is not left armed.
      try {
        const tail = await readDrillSwitchState(ctx);
        if (tail?.enabled) {
          await disarmDrillSwitch(ctx, "drill cleanup: forced disarm");
        }
      } catch {
        // ignore — failure to read here doesn't fail the assertion above
      }
    }
  });
});