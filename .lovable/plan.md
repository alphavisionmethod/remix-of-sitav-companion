

## Diagnosis

User wants the **`src/lib/` cluster sprawl** issue from `MISSING_AUDIT.md` (P2) physically fixed in the project — not just attested in a doc. The complaint: 86 top-level subdirectories with overlapping names in the AI family (`ai`, `ai-engineering`, `ai-gateway`, `sovereign-ai-gateway`) creating cognitive load.

This is a structural consolidation, not a behavioral change. Goal: collapse the AI-family overlap into a clear, single-tier hierarchy without breaking any of the 21 BLOCK gates or the ~4,800 source files that import from these clusters.

## Verification I'll do during execution

1. `ls -la src/lib/` to confirm the 86 subdir count and current AI-family folders
2. `ls src/lib/{ai,ai-engineering,ai-gateway,sovereign-ai-gateway}` to inventory contents of each
3. `grep -rn "from \"@/lib/ai" src --include="*.ts" --include="*.tsx" | wc -l` to count importers per cluster
4. Read each cluster's `index.ts` barrel to understand export surface
5. Check `scripts/architecture/checks/check-service-sprawl.ts` and `check-lib-ownership-drift.ts` to confirm what the gates allow
6. Read `src/lib/internal/` and `src/services/index.ts` façade to plan the canonical re-home target
7. Check `tsconfig.json` paths and `vite.config.ts` aliases for any pinned references

## Plan — Consolidate AI-family clusters under a single namespace

### Strategy: Canonical re-home + transparent shim

Rather than mass-renaming imports across thousands of files (high risk, would touch the BLOCK-gated frontier-truth attestation), I'll do a **registry consolidation under `src/lib/ai-platform/`** and convert the 4 overlapping folders into thin re-export shims. This is the same pattern Phase 18 used for `canonical-backend` and `simulation`.

### Step 1 — Create canonical home `src/lib/ai-platform/`

New structure:
```
src/lib/ai-platform/
├── index.ts              # Single barrel, namespaced sub-exports
├── README.md             # Domain map (gateway / engineering / sovereign / runtime)
├── gateway/              # ← was src/lib/ai-gateway
├── engineering/          # ← was src/lib/ai-engineering
├── sovereign/            # ← was src/lib/sovereign-ai-gateway
└── runtime/              # ← was src/lib/ai (the runtime client surface)
```

The new barrel exports each subdomain under a namespace:
```ts
export * as Gateway from "./gateway";
export * as Engineering from "./engineering";
export * as Sovereign from "./sovereign";
export * as Runtime from "./runtime";
```

### Step 2 — Move content (file moves, not rewrites)

For each of the 4 source folders, move all files into the new home preserving relative imports inside each cluster. Internal cross-cluster imports (rare) get rewritten to the new paths.

### Step 3 — Convert old folders into transparent shims

Each old folder (`src/lib/ai`, `ai-engineering`, `ai-gateway`, `sovereign-ai-gateway`) keeps **only** an `index.ts` that re-exports from the new home. This preserves all ~hundreds of existing `import { X } from "@/lib/ai-gateway"` statements without touching them.

```ts
// src/lib/ai-gateway/index.ts (shim)
export * from "@/lib/ai-platform/gateway";
```

Mark each shim with a deprecation header so future code uses the canonical path.

### Step 4 — Update governance artifacts

- Add `ai-platform` to the allowlist in `scripts/architecture/checks/check-lib-ownership-drift.ts`
- Add the 4 shim folders to the residual baseline in `generated/lib-remediation/lib-canonicality-baseline.json` (already there as in-migration; confirm)
- Update `src/services/index.ts` façade if it references the old paths
- Update `MISSING_AUDIT.md` Part XIII (drift) and Part XIV (P2 fix #) to mark AI-family consolidation as RESOLVED, with `before/after` cluster count (86 → 86 physically, but 4 are now thin shims pointing at 1 canonical home)

### Step 5 — Validators & gates (no new gates needed)

Run the existing 21 BLOCK gates plus:
- `npm run check:service-sprawl`
- `npm run check:lib-ownership-drift`
- `npm run check:residual-lib-canonicality`
- `npx tsc --noEmit` — must be 0 errors
- `npm run release:readiness` — must remain 21/21 GREEN

### Step 6 — Doc reconciliation

Update `public/generated/MISSING_AUDIT.md` AND `/mnt/documents/MISSING_AUDIT.md`:
- Part III (Cluster Audit) — mark the AI family as consolidated, link to `ai-platform/README.md`
- Part XIII (Drift) — add the 4 new shims to the "intentional in-migration" list
- Part XIV (Fix Plan) — strike the "AI-family sprawl" P2 item, add a "RESOLVED 2026-04-20" marker

## What this does NOT touch

- No edits to any `import` statements outside the 4 affected folders
- No DB, edge function, auth, or RLS changes
- No changes to the 21 BLOCK gate count or any release pipeline behavior
- No changes to `src/components/`, `src/pages/`, `src/hooks/`, or `electron/`
- No package.json, tsconfig, or vite.config changes (aliases stay intact)

## Verification after approval

```bash
ls src/lib/ai-platform/                                      # 4 subdirs + index.ts + README.md
cat src/lib/ai-gateway/index.ts                              # 1-line re-export shim
cat src/lib/ai/index.ts                                      # 1-line re-export shim
cat src/lib/ai-engineering/index.ts                          # 1-line re-export shim
cat src/lib/sovereign-ai-gateway/index.ts                    # 1-line re-export shim
npx tsc --noEmit                                             # 0 errors
npm run check:service-sprawl                                 # PASS
npm run check:lib-ownership-drift                            # PASS
npm run release:readiness                                    # 21/21 BLOCK GREEN
md5sum public/generated/MISSING_AUDIT.md /mnt/documents/MISSING_AUDIT.md  # identical
```

Result: AI-family cognitive load is collapsed to a single canonical home, every existing importer keeps working unchanged, and the 21 BLOCK gates stay green.

