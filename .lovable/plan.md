

# Plan: Fix Missing Test Specs + Rewrite Audit Document v4.1

## Summary

Create the 8 missing test/spec files identified in the user's tables, then rewrite the audit document with updated status reflecting what was actually fixed. The downloadable artifact will also be regenerated.

## Part 1 — Create 5 Missing E2E Playwright Specs

### 1. `tests/e2e/edge-function-receipt-emission.spec.ts` (P1)
- Playwright spec that navigates to an AI-powered page (e.g., boardroom, advisor)
- Triggers an AI action via the UI
- Intercepts the network request to edge functions
- Validates that the response includes receipt headers or that the `ai_inference_receipts` / `ai_action_receipts` table gets a row
- Falls back to structural check if no auth: verify the edge function code imports receipt helpers

### 2. `tests/e2e/degraded-mode-recovery.spec.ts` (P2)
- Extends existing `degraded-mode.spec.ts` (which is Vitest import-only, not real Playwright)
- Real Playwright spec: simulates offline via `context.setOffline(true)`
- Verifies degraded UI banner appears
- Re-enables network, verifies recovery to normal state
- Checks that no data loss occurred during the cycle

### 3. `tests/e2e/mobile-responsive-journey.spec.ts` (P2)
- Playwright spec at 375x812 viewport (iPhone)
- Navigates key routes: login, dashboard/pulse, settings
- Validates touch-friendly elements are visible (min 44px tap targets)
- Checks no horizontal overflow
- Extends beyond existing `mobile-journey.spec.ts` (which is Vitest, not real Playwright) and `responsive.spec.ts`

### 4. `tests/e2e/admin-board-crud.spec.ts` (P2)
- Playwright spec testing admin board operations
- Navigate to admin boards page
- Verify board list renders
- Test create form visibility and field validation
- Test edit/delete button presence and interaction
- Validates proper error states for unauthorized access

### 5. `tests/e2e/advisor-action-execution.spec.ts` (P2)
- Playwright spec for advisor action queue flow
- Navigate to advisor page
- Verify action queue UI renders
- Test action approval/rejection buttons
- Validate execution feedback (toast/status change)
- Check that action receipts are recorded

## Part 2 — Create 3 Missing OS Validation Specs

### 6. `src/__tests__/os/os-vmware-ova-ci.spec.ts`
- Vitest contract test for VMware OVA pipeline
- Validates `os/vmware/build-ova.sh` exists, is executable, uses `set -euo pipefail`
- Validates OVA manifest schema: `version`, `format`, `diskImage`, `vmx` config keys
- Validates CI workflow `os-build-iso.yml` references OVA step
- Validates `qemu-img` conversion command pattern exists in the script

### 7. `src/__tests__/os/os-reproducibility-multi-host.spec.ts` (replaces `os-reproducibility.spec.ts`)
- Extends existing `os-reproducibility-contracts.test.ts`
- Validates that reproducibility verification script supports multi-host comparison
- Checks for `SITA_SECOND_HOST` env var handling in `verify-reproducibility.sh`
- Validates report schema includes `hosts` array (not just single host)
- Documents the gap: currently single-host only

### 8. `src/__tests__/os/hw-matrix-validation.spec.ts`
- Vitest contract test for hardware support matrix
- Validates a hardware matrix registry file exists (or creates contract for one)
- Schema: array of `{ platform, arch, tested, tpmVersion, secureBootSupported, lastValidated }`
- Currently only 1 reference platform — test documents this honestly
- Validates that QEMU config covers the reference platform

## Part 3 — Rewrite Audit Document to v4.1

File: `docs/os/SITA_OS_NATIVE_DEPLOYMENT_AUDIT.md`

Changes from v4.0:
- **§5 E2E Suite**: Update from 73 to 78 Playwright specs (5 new), listing each new spec with its assertion count
- **Missing Specs Table**: Replace the "🔴 NEEDS" rows with "✅ shipped" + test file path for all 5 E2E specs
- **§2 OS Native**: Add 3 new contract specs to the inventory, update from "22 scripts" to "22 scripts + 3 validation specs"
- **P1-1, P1-2, P1-3 table**: Update status from "❌ NEEDS" to "✅ contract test shipped" with honest note that these are contract-level, not hardware-behavioral
- **§15 Confidence**: Slight bump — Web App from 96% to 96.5% (5 new E2E specs close the gap), OS Native stays 40% (contract tests don't change this)
- **§18 PM Tracker**: Add row for "Create missing E2E specs" → ✅ done
- All other sections remain unchanged — no score inflation

## Part 4 — Downloadable Artifact

Regenerate `/mnt/documents/SITA_OS_OSAUDIT_v4.1.md` with updated content.

## Files Created/Modified

1. `tests/e2e/edge-function-receipt-emission.spec.ts` — new (Playwright)
2. `tests/e2e/degraded-mode-recovery.spec.ts` — new (Playwright)
3. `tests/e2e/mobile-responsive-journey.spec.ts` — new (Playwright)
4. `tests/e2e/admin-board-crud.spec.ts` — new (Playwright)
5. `tests/e2e/advisor-action-execution.spec.ts` — new (Playwright)
6. `src/__tests__/os/os-vmware-ova-ci.spec.ts` — new (Vitest)
7. `src/__tests__/os/os-reproducibility-multi-host.spec.ts` — new (Vitest)
8. `src/__tests__/os/hw-matrix-validation.spec.ts` — new (Vitest)
9. `docs/os/SITA_OS_NATIVE_DEPLOYMENT_AUDIT.md` — rewrite to v4.1
10. `/mnt/documents/SITA_OS_OSAUDIT_v4.1.md` — downloadable artifact

