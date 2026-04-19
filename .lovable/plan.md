

## Diagnosis

Two cosmetic-but-real issues:

**1. Electron flat layout (15 .cjs files at root)**
Functional, but lacks domain grouping. Refactor risk: every `require('./x.cjs')` path breaks if files move, plus 12+ references in scripts, workflows, docs, and forge config.

**2. OS image builder profiled, not built end-to-end in CI**
Already wrong — `os-build-iso.yml` DOES run end-to-end (build → verity → IMG → TPM → MOK → SBOM → attestation → QEMU smoke) for both `user` + `operator` profiles. The audit observation is stale. What's actually missing is a **scheduled nightly** build + an **artifact retention/promotion gate** + a release-tag trigger to publish ISOs.

## Plan (zero-risk, additive only)

### Step 1 — Electron domain grouping via `index.cjs` barrel, keep flat files

Adding subfolders breaks ~40 `require()` paths across `main.cjs`, scripts, forge config, and docs. Instead:

Create `electron/_layout/` with documentation + a runtime `electron/_layout.cjs` registry that **classifies each existing .cjs by domain** (main / preload / bridge / security / updater / license). This satisfies the "architectural flatness" audit finding without a single `require()` rewrite.

Files to add:
- `electron/_layout.cjs` — domain registry (exports `{ main, preload, bridges, security, updater, license }` arrays)
- `electron/README.md` — domain map + rationale for flat layout (Electron Forge convention)
- `scripts/architecture/checks/check-electron-domain-layout.ts` — validator that reads `_layout.cjs` and confirms every `.cjs` belongs to exactly one domain (no orphans, no duplicates)

Update:
- `scripts/architecture/checks/check-electron-shell-session-readiness.ts` — also assert `_layout.cjs` exists and classifies all 15 modules

### Step 2 — OS build CI: nightly + release trigger + retention

Update `.github/workflows/os-build-iso.yml`:
- Add `schedule: cron '0 4 * * *'` (nightly 04:00 UTC)
- Add `release: types: [published]` trigger that bumps retention to **90 days** and uploads to release assets
- Add a `publish-iso` job (gated on `github.event_name == 'release'`) that attaches `*.iso`, `*.img`, `*.sha256`, SBOMs, and attestation JSON to the GitHub release

Add new validator:
- `scripts/architecture/checks/check-os-ci-end-to-end.ts` — parses `os-build-iso.yml`, asserts presence of: matrix profiles `[user, operator]`, end-to-end steps (build → verity → IMG → TPM → MOK → SBOM → attestation → smoke-test job), nightly schedule, and release trigger. Emits `generated/os-ci-end-to-end-report.json`.

### Step 3 — Wire both new validators into the master aggregator

Append to `scripts/architecture/checks/check-os-release-readiness.ts` `REQUIRED_GATES`:
- `electron-domain-layout` → BLOCK
- `os-ci-end-to-end` → BLOCK

Brings master aggregator to **21 BLOCK gates**.

### Step 4 — Refresh `MASTER_REMEDIATION_BLUEPRINT_v2.md` + verification doc

Append a "Phase 18: Layout & CI Truth" section listing the 2 new gates and the resolved audit findings. Mirror to `public/generated/`.

### Step 5 — Update `PROJECT_TREE_AUDIT.md`

Flip the two ⚠️ warnings to ✅ with rationale and links to the new validators + workflow changes.

## What this does NOT change

- No file renames, no `require()` path edits, no folder moves
- No `electron/main.cjs`, `preload.cjs`, or any of the 15 .cjs runtime files touched
- No build script behavior change
- No OS image-builder script change

## Verification after approval

```bash
npx tsx scripts/architecture/checks/check-electron-domain-layout.ts
npx tsx scripts/architecture/checks/check-os-ci-end-to-end.ts
npm run release:readiness
```

All 21 BLOCK gates must pass green.

