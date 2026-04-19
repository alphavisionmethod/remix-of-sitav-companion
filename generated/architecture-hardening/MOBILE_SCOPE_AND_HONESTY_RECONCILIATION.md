# Mobile Scope and Honesty Reconciliation

**Generated:** 2026-04-19
**Status:** ✅ Already contained — this doc canonicalizes the existing closure.

## 1. Canonical truth (do not duplicate)

Native iOS/Android are **ARCHIVED** with no active deployment scope. Authoritative sources:

- `MOBILE_HONESTY.md` (root) — install-page truth
- `archive/mobile/ARCHIVED.md` — historical context
- `archive/capacitor/` — frozen Capacitor config
- `generated/mobile-scope-closure/` — full closure evidence pack
- `src/components/admin/ai-runtime/MobileScopeTruthPanel.tsx` — operator-facing truth view

## 2. Containment enforcement (this pass)

New validator **`check-mobile-archived-scope.ts`** (BLOCK) asserts:

1. `capacitor.config.ts` / `capacitor.config.js` does NOT exist at repo root
2. `@capacitor/*` does NOT appear in `package.json` dependencies or devDependencies
3. Forbidden phrases ("ship to iOS", "install from App Store", "native iOS app available", etc.) do not appear in `src/pages/**` outside files that explicitly link to `MOBILE_HONESTY.md` or `mobile-scope-truth`

## 3. Wired into release gates

Gate name: `mobile-archived-scope` — added to BLOCK list in `scripts/architecture/checks/check-os-release-readiness.ts`.

## 4. Reactivation conditions (canonical)

Native mobile reactivation requires:
- Apple Developer Program membership ($99/yr)
- Google Play Developer account ($25 one-time)
- TestFlight + Play Console pipeline
- Restoration of archived Capacitor config + scripts
- Re-emission of `mobile-scope-closure/` as `mobile-active-scope/`

Until then: web-responsive remains the canonical mobile experience.

## 5. Cross-references

- `generated/mobile-scope-closure/MOBILE_NATIVE_OUT_OF_SCOPE_TRUTH.md`
- `generated/mobile-scope-closure/REACTIVATION_CHECKLIST.md`
- `scripts/validation/check-mobile-native-out-of-scope-truth.ts` (existing)
- `scripts/validation/check-no-active-native-mobile-claims.ts` (existing)
- `scripts/validation/check-mobile-archived-scope.ts` (NEW this pass)

## 6. Linked install surfaces

`/install` and any install/distribution surface that mentions mobile must link to `MOBILE_HONESTY.md`. Existing validator `install-page-mobile-honesty` enforces this.
