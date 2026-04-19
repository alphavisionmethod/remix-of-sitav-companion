

## Audit Verdict — Mobile Native Scope Closure

**Already complete (verified live):**
- ✅ All 9 of 10 required deliverables present in `generated/mobile-scope-closure/`
- ✅ All 4 required JSON artifacts present
- ✅ All 5 validation gates exist + emitter exists
- ✅ Wired into `check-os-release-readiness.ts` BLOCK list (lines 202-206)
- ✅ npm scripts `mobile:scope:emit` + `mobile:scope:run-all` present
- ✅ `MobileHonestyNotice` rendered on all 3 install surfaces (gate GREEN)
- ✅ `MobileScopeTruthPanel` integrated into Admin AI Engineer hub
- ✅ `docs/MOBILE_HONESTY.md` canonical doc live
- ✅ Containment complete: `archive/capacitor/`, `archive/infra/`, `archive/mobile/` populated
- ✅ Zero `@capacitor/*` deps in `package.json`
- ✅ Zero stray native files at active paths (`capacitor.config.ts`, `infra/deploy/mobile.yaml`, `mobile/` all archived)
- ✅ 4 of 5 gates GREEN

**Real gaps — must close for 100% completion:**

1. **Missing required deliverable**: `generated/mobile-scope-closure/MOBILE_MANIFEST_AND_WORKFLOW_RECONCILIATION.md` is named explicitly in PART 6 of the spec but does not exist. All 9 other deliverables are present.

2. **`check-generated-mobile-truth-consistency` gate is RED (2 errors)**: The validator's regex `/^(mobile|capacitor|android|ios|no-flutter|native-project|final-mobile)/i` blindly catches its own canonical gate-report outputs:
   - `mobile-native-out-of-scope-truth-report.json`
   - `mobile-manifest-archive-classification-report.json`
   
   These are written by `_lib/emit-gate-report.ts` to `generated/` for the gates themselves and for `install-page-mobile-honesty` etc. — they are legitimate canonical outputs of THIS closure work, not contamination drift. The validator must allowlist sibling gate-report names.

3. **Same bug in `emit-mobile-scope-artifacts.ts`** (line 125): same regex flags the same self-generated reports as "stray", causing `mobile-scope-verification.json` to flip `no_stray_generated_mobile_truth=false` → `status: RED` → misreporting truth on the Admin AI Engineer "Mobile Scope Truth" tab. This is a real launch-honesty defect (reports red when reality is green).

## Plan to Close the 3 Gaps

### Phase 1 — Write the missing canonical deliverable

Create `generated/mobile-scope-closure/MOBILE_MANIFEST_AND_WORKFLOW_RECONCILIATION.md` documenting the actual reconciliation that was performed:
- `infra/deploy/mobile.yaml` → `archive/infra/mobile.yaml` (with ARCHIVED banner)
- `capacitor.config.ts` → `archive/capacitor/capacitor.config.ts` (with ARCHIVED banner)
- `mobile/` (Android/iOS templates, store metadata, icons) → `archive/mobile/`
- 8 `@capacitor/*` deps removed from `package.json`
- 16 stale `generated/mobile-*.json` reports moved to `archive/generated/mobile/`
- 16 stale `mobile:*` npm scripts retired
- Old `check-mobile-*.ts` and `check-capacitor-*.ts` validators archived to `archive/scripts/`
- Per-artifact disposition table (path → archive path → classification → drift gate)

### Phase 2 — Fix the validator self-flagging bug (correctness, not loosening)

Edit `scripts/validation/check-generated-mobile-truth-consistency.ts`:
- Add `ALLOWED_GATE_REPORTS` set containing the 5 canonical gate-report filenames produced by THIS closure work:
  - `mobile-native-out-of-scope-truth-report.json`
  - `no-active-native-mobile-claims-report.json`
  - `install-page-mobile-honesty-report.json`
  - `mobile-manifest-archive-classification-report.json`
  - `generated-mobile-truth-consistency-report.json`
- Skip these in the stray-prefix scan (they are legitimate sibling outputs of the canonical closure suite)
- Strict drift detection preserved: any `mobile-*.json` / `capacitor-*.json` / `android-*.json` / `ios-*.json` / `no-flutter-*.json` / `native-project-*.json` / `final-mobile-*.json` NOT on the allowlist still fails RED

### Phase 3 — Apply the same fix to the emitter (truth surface honesty)

Edit `scripts/validation/emit-mobile-scope-artifacts.ts` (line 122-129):
- Apply identical `ALLOWED_GATE_REPORTS` allowlist in the stray-mobile-JSON scan
- Re-run emitter so `mobile-scope-verification.json.checks.no_stray_generated_mobile_truth` flips to `true` and `status` flips to `GREEN`
- This makes the `MobileScopeTruthPanel` in the Admin AI Engineer hub display GREEN truth (currently displays misleading RED)

### Phase 4 — Re-verify end-to-end

- Run all 5 gates → expect 5/5 GREEN
- Run emitter → expect `verification.status = "GREEN"`, all `acceptance.*` flags `true`
- Update `MOBILE_SCOPE_FINAL_VERIFICATION.md` with new evidence (5/5 GREEN, all 10 deliverables present, GREEN admin tab proof)
- Confirm `MobileScopeTruthPanel` renders the green state (already wired to read `mobile-scope-verification.json`)

### Files touched
- **New (1):** `generated/mobile-scope-closure/MOBILE_MANIFEST_AND_WORKFLOW_RECONCILIATION.md`
- **Edited (3):** `scripts/validation/check-generated-mobile-truth-consistency.ts` (+allowlist), `scripts/validation/emit-mobile-scope-artifacts.ts` (+same allowlist), `generated/mobile-scope-closure/MOBILE_SCOPE_FINAL_VERIFICATION.md` (refresh evidence)
- **Regenerated (4):** all 4 JSON artifacts in `generated/mobile-scope-closure/` via the emitter

### Guardrails
- **No loosening of drift detection**: allowlist is exactly the 5 canonical gate-report names from THIS closure; any future stray mobile artifact still fails RED
- **No new UI**: `MobileScopeTruthPanel` already wired — fix surfaces correctly without code changes to the panel
- **No data loss**: all containment from prior phases preserved
- **No new tables, no duplicate dashboards**

After this pass, all 8 PART 8 acceptance criteria are satisfied with 5/5 GREEN gates, 10/10 deliverables, and the Admin AI Engineer "Mobile Scope Truth" tab displays accurate live GREEN truth.

