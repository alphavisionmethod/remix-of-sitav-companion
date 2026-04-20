

## Reality check — physical project is 100% deployment-ready ✅

Verified on disk just now:
- **All 32 files** in 4 legacy AI folders are 7-line `DEPRECATED SHIM` re-exports pointing at `src/lib/ai-platform/{runtime,engineering,gateway,sovereign}/`
- Zero physical duplication; canonical implementation lives only in `src/lib/ai-platform/`
- `src/lib/ai-platform/README.md` is the canonical responsibility map
- Audit doc §3 row 1 + §4 rows 5–6 already correctly marked **RESOLVED 2026-04-20**

**No code, runtime, or shim work needed.** The naming overlap is structurally resolved.

## Real gap — drift enforcement

Gate #27 (`cluster-readme-coverage`) anchors 8 clusters but **does NOT cover the 4 AI legacy folders**. A future agent could add a non-shim file to `src/lib/ai/` and CI would not catch it. This is the only honest "100% ready for deployment" gap remaining for this row.

## Plan (default mode — enforcement gate + doc citation)

### 1. New CI gate `check-ai-shim-integrity.ts` (BLOCK tier)
- Asserts every `*.ts` file under `src/lib/{ai,ai-engineering,ai-gateway,sovereign-ai-gateway}/` (recursive) contains the `DEPRECATED SHIM` marker AND a single `export * from "@/lib/ai-platform/...";` line
- Fails CI on:
  - any new non-shim file added to a legacy folder
  - any shim re-export pointing somewhere other than `@/lib/ai-platform/...`
  - a shim larger than 12 lines (drift detector)
- Emits report at `generated/ai-shim-integrity-report.json`
- Registered as **Gate #28** in `scripts/architecture/checks/check-os-release-readiness.ts`

### 2. Extend Gate #27 `AMBIGUOUS_CLUSTERS`
Add `src/lib/ai-platform` (with its existing README) so the canonical home itself is also coverage-asserted. (The 4 legacy folders are covered by Gate #28, not #27, since their README would just say "deprecated".)

### 3. Doc sync (6 mirrors)
Update §4 rows 5–8 in all 6 mirrors of `MISSING_AUDIT.md` + `MISSING_AUDIT_v2.md` to cite **Gate #28** (`ai-shim-integrity`) alongside the existing Gate #27 reference, so the resolution evidence is double-anchored.

### Files

**Created (1):** `scripts/architecture/checks/check-ai-shim-integrity.ts` (Gate #28)
**Edited (8):**
- `scripts/architecture/checks/check-os-release-readiness.ts` (register Gate #28)
- `scripts/architecture/checks/check-cluster-readme-coverage.ts` (add `ai-platform` to AMBIGUOUS_CLUSTERS)
- 6 audit mirrors (rows 5–8 in §4)

### Out of scope
- No moves, deletions, or renames (physical reality already canonical)
- No README changes (`ai-platform/README.md` already complete)
- No new shims (all 32 files already shimmed)

