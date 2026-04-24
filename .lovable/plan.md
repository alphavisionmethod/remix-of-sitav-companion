# Phase 4 — Final Stabilization & Deployment Readiness

Execute end-to-end in default mode. No new product scope.

## 4A — Verify/patch dual-shape Supabase mock
- Inspect `src/test/test-utils.tsx::makeChainableQuery`.
- Ensure it supports BOTH:
  - Sync destructure: `const { data, error } = supabase.from('t').select()`
  - Async chain: `await supabase.from('t').select().eq('id', x)`
- Patch only if a regression is confirmed.

## 4B — Sharded vitest run
- Run `npx vitest run --shard=1/4` … `4/4` sequentially (each well under the 8-min cap).
- Capture failures into `generated/phase4-vitest-inventory.txt`.

## 4C — Targeted fixes
- Cluster failures by root cause (mock shape, missing provider, snapshot drift, router nesting).
- Apply minimal patches; re-run only the affected shard until green.
- Cap at ~25 file edits; anything beyond gets logged as a follow-up gap.

## 4D — Cron freshness test (G10)
- Create `src/__tests__/cron/cron-freshness.test.ts`.
- For every `[functions.*]` block in `supabase/config.toml`:
  - Assert `supabase/functions/<name>/index.ts` exists.
  - Where applicable, assert presence in `EDGE_FUNCTION_REGISTRY`.

## 4E — Pre-deploy gate
- Run `bash scripts/pre-deploy.sh` end-to-end.
- Resolve any blocker surfaced by: typecheck, eslint, vitest, deployment-readiness gate, vite build, route count, demo-mode safety, dead handlers, as-any, import integrity, demo leak, service consumer scans.

## 4F — Final audit update
- Update `STABILIZATION_AUDIT.md`:
  - G1–G13 final status table.
  - Bundle metrics (post-`manualChunks`).
  - Test pass rate and shard timings.
  - Deployment confidence score (target ≥ 95%).

## Exit criteria
- `bash scripts/pre-deploy.sh` exits 0.
- Vitest pass rate ≥ 99% across all shards (any remaining failures explicitly catalogued and justified).
- `STABILIZATION_AUDIT.md` reflects final state with deployment-ready verdict.

## Out of scope (deferred)
- New features.
- Bundle code-splitting beyond what `vite.config.ts` already does (G5 stays MEDIUM).
- Full lint cleanup beyond what `pre-deploy.sh` enforces.
