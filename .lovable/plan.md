

## Diagnosis

User wants two things:
1. **Verify** the onboarding-entrypoint consolidation from the previous loop is 100% in place on disk (registry, deprecation banners, intent banners, validator, phantom-barrel collapse, BLOCK gates still green).
2. **Update `MISSING_AUDIT.md`** (both `/mnt/documents/MISSING_AUDIT.md` and `public/generated/MISSING_AUDIT.md`) to reflect the resolution — strike the P2 "Multiple onboarding entrypoints" item, mark Part XI with the 3-tier model, and add the RESOLVED 2026-04-20 marker per Truth-Only doc governance.

This is a verification + documentation task, not a code-behavior change.

## Verification I'll do during execution

1. **Registry exists & shape correct** — `cat src/lib/architecture/onboarding-surface-registry.ts`, confirm 3 surfaces (`os-first-boot`, `business-formation`, `money-introduction`).
2. **Deprecation banners present** — `grep -c "DEPRECATED" src/hooks/useOnboardingDaemon.ts src/lib/services/onboarding-daemon/index.ts` ≥ 2.
3. **Intent banners present** — `grep -l "ONBOARDING SURFACE" src/components/sita/OSSetupExperience.tsx src/pages/revenue-office/onboarding/FormationShell.tsx src/components/sita/money-onboarding/MoneyOnboardingFlow.tsx` → 3 files.
4. **Phantom barrels collapsed** — `cat src/domains/setup/index.ts src/platform/setup/index.ts src/lib/services/onboarding/index.ts` all re-export the registry.
5. **Validator wired** — `cat scripts/architecture/checks/check-onboarding-surface-truth.ts` exists; `grep onboarding-surface-truth package.json` returns the script entry.
6. **Validator passes** — run `npm run check:onboarding-surface-truth`, expect 0 errors / 0 warnings.
7. **Type integrity** — `npx tsc --noEmit` returns 0 errors.
8. **Release gates** — `npm run release:readiness` returns 21/21 BLOCK GREEN.
9. **No stray daemon importers** — `grep -rn "useOnboardingDaemon" src --include="*.ts" --include="*.tsx"` returns only the deprecated hook itself, its barrel, and `pages/FirstBootSetup.tsx` (the legitimate compat consumer).
10. **Doc mirror integrity** — `md5sum public/generated/MISSING_AUDIT.md /mnt/documents/MISSING_AUDIT.md` identical pre-edit.

## Plan

### Step 1 — Read & verify on-disk state (no edits)
Run the 10 verification checks above in parallel batches. Capture exact line counts, file hashes, and validator stdout.

### Step 2 — Locate target sections in `MISSING_AUDIT.md`
Read `public/generated/MISSING_AUDIT.md` to find the precise line ranges for:
- **Part III** (Cluster Audit) — onboarding cluster row
- **Part XI** (Onboarding Journey) — the "22 vs 29" finding
- **Part XIII** (Drift) — phantom barrels list
- **Part XIV** (Fix Plan) — the P2 "Multiple onboarding entrypoints" item

### Step 3 — Apply targeted doc updates (one source, mirrored)

Per Truth-Only governance (resolved items get purged, not fattened), updates are surgical:

| Section | Change |
|---|---|
| **Part III** Cluster Audit | Replace the onboarding cluster row's status with: `CONSOLIDATED → src/lib/architecture/onboarding-surface-registry.ts (3 declared tiers)` |
| **Part XI** Onboarding Journey | Replace the "29 master / 22 implemented mismatch" finding with the 3-tier resolution table (OS / Business / Money) and link to the registry + `check:onboarding-surface-truth` validator |
| **Part XIII** Drift | Move "phantom onboarding barrels" from OPEN to RESOLVED; cite the 3 files now re-exporting the registry |
| **Part XIV** Fix Plan | **Strike** the "Multiple onboarding entrypoints" P2 item (Truth-Only purge) OR replace with one-line `RESOLVED 2026-04-20 — see registry + validator` if the doc keeps a resolution ledger |
| **Header metadata** | Bump audit timestamp / revision marker |

Write to `public/generated/MISSING_AUDIT.md`, then `cp` to `/mnt/documents/MISSING_AUDIT.md`. Confirm `md5sum` identical post-edit.

### Step 4 — Final verification
- `grep -c "Multiple onboarding entrypoints" public/generated/MISSING_AUDIT.md` → 0 (or 1 if kept as RESOLVED ledger entry — decide based on doc's existing convention found in Step 2)
- `grep -c "onboarding-surface-registry" public/generated/MISSING_AUDIT.md` → ≥ 3 (Part III, XI, XIII references)
- `grep -c "RESOLVED 2026-04-20" public/generated/MISSING_AUDIT.md` → ≥ 1
- `md5sum` mirror check identical
- Re-run `npm run release:readiness` → 21/21 BLOCK GREEN unchanged
- Emit `<lov-artifact path="MISSING_AUDIT.md" mime_type="text/markdown">` for download

## What this does NOT touch

- No code edits to `OSSetupExperience`, `FormationShell`, `MoneyOnboardingFlow`, the registry, the validator, or any hook
- No changes to the 21 BLOCK gates or any release pipeline
- No DB / RLS / edge function / auth changes
- No new validators, scripts, or registries (the previous loop already created them)
- Only `public/generated/MISSING_AUDIT.md` and `/mnt/documents/MISSING_AUDIT.md` are modified

## Files touched

**Modified (2):**
- `public/generated/MISSING_AUDIT.md`
- `/mnt/documents/MISSING_AUDIT.md`

