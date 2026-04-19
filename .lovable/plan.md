

## Mobile Native Scope Closure — 5 Phase Plan

**Decision:** Native iOS/Android = ARCHIVED / FUTURE_VISION_ONLY. Active deployment = Web SPA + Ubuntu-native + Electron. Eliminate the contradiction where `PLATFORM_SCOPE.md` says "Capacitor deleted" but `capacitor.config.ts`, 8 deps, and 16 generated reports still claim store-readiness.

**Scoping rule:** All new operator-visible UI lives **only inside the Admin AI Engineer hub** (`AIRuntimeHome` → new "Mobile Scope Truth" tab). No new user-facing pages.

---

### Phase 1 — Audit & canonical model (docs only)

Create `generated/mobile-scope-closure/` with:
- `MOBILE_SCOPE_REFERENCE_AUDIT.md` — every mobile reference classified (safe-archived / contradiction / must-rewrite)
- `MOBILE_SCOPE_CANONICAL_MODEL.md` — canonical vocabulary: `ARCHIVED`, `FUTURE_VISION_ONLY`, `NOT_LAUNCH_SURFACE`, `OPTIONAL_FUTURE_PROGRAM`
- `INSTALL_AND_DISTRIBUTION_SURFACE_AUDIT.md` — `DownloadPage`, `DownloadsCenter`, `ExternalInstallerPage` audit
- `MOBILE_REACTIVATION_CONDITIONS.md` — explicit gates for any future mobile revival

Create canonical honesty doc: **`docs/MOBILE_HONESTY.md`** (single source of truth that all surfaces link to).

### Phase 2 — Contain the live mobile scaffolding

- **Move** `capacitor.config.ts` → `archive/capacitor/capacitor.config.ts` (with header banner: ARCHIVED / FUTURE_VISION_ONLY)
- **Move** `infra/deploy/mobile.yaml` → `archive/infra/mobile.yaml` with same banner
- **Move** active `mobile/` directory → `archive/mobile/` (preserves Capacitor config, Android/iOS templates, store metadata for future reactivation)
- **Remove** 8 `@capacitor/*` deps from `package.json` (they're unused — no `import "@capacitor/*"` exists in `src/`; verified)
- Add `archive/mobile/ARCHIVED.md` explaining the containment policy

### Phase 3 — Reconcile generated reports (machine-readable truth)

Move all 16 conflicting `generated/mobile-*.json` reports to `archive/generated/mobile/` (already partially done — finish it). Emit fresh canonical artifacts in `generated/mobile-scope-closure/`:
- `mobile-scope-status.json` → `{status: "ARCHIVED", active_deployment: false}`
- `install-surface-honesty-status.json` → confirms 3 install surfaces link to `MOBILE_HONESTY.md`
- `mobile-manifest-status.json` → confirms zero active mobile manifests
- `mobile-scope-verification.json` → final pass/fail rollup

Add emitter script `scripts/validation/emit-mobile-scope-artifacts.ts`.

### Phase 4 — Honesty wiring on install surfaces (Admin AI Engineer hub only for new UI)

- Add a small `<MobileHonestyNotice>` link/banner to `DownloadPage.tsx`, `DownloadsCenter.tsx`, and `ExternalInstallerPage.tsx` pointing to `/docs/MOBILE_HONESTY.md`. Reuses existing `Alert` component — no new design system.
- Add new tab **"Mobile Scope Truth"** to `AIRuntimeHome` rendering a read-only `MobileScopeTruthPanel` that loads `mobile-scope-verification.json` and shows: archived status, validation gate results, reactivation conditions checklist. No duplicate dashboard — reuses the same panel pattern as `ConnectorTruthSummaryPanel`.

### Phase 5 — Validation gates (drift prevention)

Create 5 new validators (all wired into `check-os-release-readiness.ts` BLOCK list and a new `mobile:scope:run-all` npm script):
1. `check-mobile-native-out-of-scope-truth.ts` — fails if `capacitor.config.ts` returns to repo root or `@capacitor/*` deps reappear in `package.json`
2. `check-no-active-native-mobile-claims.ts` — greps docs/UI for forbidden phrases ("store-ready", "App Store submission ready", etc.) outside `archive/`
3. `check-install-page-mobile-honesty.ts` — asserts `DownloadPage`/`DownloadsCenter`/`ExternalInstallerPage` link to `MOBILE_HONESTY.md`
4. `check-mobile-manifest-archive-classification.ts` — asserts no `infra/deploy/mobile.yaml` at active path; archived copy must have ARCHIVED banner
5. `check-generated-mobile-truth-consistency.ts` — asserts no active `generated/mobile-*.json` outside the `mobile-scope-closure/` canonical set

Update `docs/PLATFORM_SCOPE.md` to remove the false claim "Deleted `capacitor.config.ts` + 12 `@capacitor/*` deps" — replace with accurate "Archived to `archive/capacitor/` and `archive/mobile/` on 2026-04-19; deps removed."

Retire the 16 stale `mobile:*` npm scripts in `package.json` (replace `mobile:run-all` with a single `mobile:scope:run-all` pointing to the 5 new gates). Old validator scripts in `scripts/validation/check-mobile-*.ts` and `check-capacitor-*.ts` move to `archive/scripts/`.

---

### Files touched
- **New (12):** 5 markdown + 4 JSON in `generated/mobile-scope-closure/`, `docs/MOBILE_HONESTY.md`, `MobileScopeTruthPanel.tsx`, emitter script
- **New validators (5):** in `scripts/validation/`
- **Moved/archived (~30):** `capacitor.config.ts`, `infra/deploy/mobile.yaml`, `mobile/` dir, 16 stale `generated/mobile-*.json`, ~16 stale `check-mobile-*.ts` validators
- **Edited (6):** `package.json` (remove 8 deps, retire 16 npm scripts, add 1), `docs/PLATFORM_SCOPE.md`, 3 download/install pages (+ honesty notice), `AIRuntimeHome.tsx` (+1 tab), `check-os-release-readiness.ts` (+5 BLOCK gates)

### Guardrails
- **No duplicate UI**: reuses `AIRuntimeHome` tab pattern + existing `Alert` component
- **No data loss**: containment, not deletion — every archived asset preserved under `archive/`
- **No web responsiveness regression**: only native-mobile shell removed; PWA + responsive web untouched
- **Future reactivation possible**: `MOBILE_REACTIVATION_CONDITIONS.md` documents the path back

After this pass, all 8 PART 8 acceptance criteria are satisfied with live evidence.

