

# SITA OS — Final Deployment Readiness Fixes

## Current State

| Area | Status |
|------|--------|
| TypeScript errors | **0** |
| Security scan | **1 warning** (ignored — Supabase Dashboard action) |
| DB linter | **Clean** |
| Edge functions | **50** with **26** test files |
| Docker + Compose | Present |
| Generated manifests | All 4 present |

## Remaining Gaps (5 items)

### 1. Missing `deploy/` scripts (3 files)
The deployment validator expects `deploy/ota-agent.sh`, `deploy/first-boot.sh`, and `deploy/metrics-agent.sh`. These scripts exist in `scripts/release/iso/` but are missing from the `deploy/` directory that the validator and docker-compose reference.

**Fix:** Create `deploy/ota-agent.sh`, `deploy/first-boot.sh`, and `deploy/metrics-agent.sh` — either as copies/symlinks of the ISO variants adapted for the Docker deploy context, or as thin wrappers.

### 2. Missing PWA manifest (`public/manifest.json`)
The app has `sw.js` but no web app manifest. Without it, the app cannot be installed as a PWA on mobile or desktop.

**Fix:** Create `public/manifest.json` with SITA OS branding (name, icons, theme color, display: standalone). Add `<link rel="manifest">` to `index.html`.

### 3. PWA icons missing
Only `favicon.ico` exists. PWA requires 192x192 and 512x512 PNG icons.

**Fix:** Generate `public/icon-192.png` and `public/icon-512.png` from the existing favicon/brand assets.

### 4. Remaining 38 files with `: any)` callbacks
Down from 963, but 38 page files still have untyped callback parameters.

**Fix:** Sweep remaining files replacing `: any)` with `Record<string, any>` or proper interfaces where the shape is known.

### 5. Update `validate-deployment.sh` paths
The validator checks `deploy/ota-agent.sh` etc. but the scripts live in `scripts/release/iso/`. Either fix the validator to also check the ISO paths, or ensure the `deploy/` copies exist (covered by item 1).

**Fix:** Update the validator to accept both locations: `deploy/` and `scripts/release/iso/`.

## Execution Order

1. Create 3 deploy scripts (`deploy/ota-agent.sh`, `deploy/first-boot.sh`, `deploy/metrics-agent.sh`)
2. Create `public/manifest.json` + PWA icons + update `index.html`
3. Sweep remaining 38 files for `: any)` type safety
4. Update `scripts/validate-deployment.sh` to pass all checks
5. Verify 0 TS errors + validator passes

## Files Changed

- **3 created:** `deploy/ota-agent.sh`, `deploy/first-boot.sh`, `deploy/metrics-agent.sh`
- **2 created:** `public/manifest.json`, PWA icons
- **1 updated:** `index.html` (manifest link)
- **~38 updated:** page files (type safety sweep)
- **1 updated:** `scripts/validate-deployment.sh` (path fixes)

