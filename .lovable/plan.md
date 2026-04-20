

## Diagnosis

The audit observation is **partially stale but reveals one real defect**:

**What exists** (audit unaware):
- `docs/runbooks/` already has **29 markdown runbooks**
- `src/lib/support/runbook-registry.ts` registers **21 runbooks** with `markdownRef`, `killSwitchRef`, `boundedContextId`, `subsystem`
- `src/lib/support/runbook-subsystem-map.ts` declares 19 mandatory subsystems — **20/19 covered** (over-covered)
- `scripts/architecture/checks/check-runbook-coverage.ts` exists as enforcement gate

**What is actually broken**:
1. **Dangling reference** — `KS-PAYMENTS-AUTH` (kill-switch-registry.ts:416) points to runbook **`RB-005-AUTH`** which does not exist. Coverage gate fails:  
   `❌ [dangling-runbook-from-switch] Kill switch KS-PAYMENTS-AUTH → unknown runbook RB-005-AUTH`
2. **Five operator narratives explicitly named in audit P1.3 are missing**: `kill-switch.md`, `ai-fallback.md`, `recovery-mode.md`, `support-bundle.md`, `evidence-purge.md` — none on disk
3. **`check-runbook-coverage` is NOT in the master release roster** (`check-os-release-readiness.ts`) — gate exists but does not block deploy
4. **Audit mirrors still claim runbooks are missing** across 4 files (lines 75, 110, 125, 600, 606, 865, 1130, 1359-1366, etc.)

## Fix — additive, no breaking changes

### Step 1 — Resolve dangling kill-switch → runbook reference

Add **RB-005-AUTH "Payment Auth / 3DS Recovery"** entry to `src/lib/support/runbook-registry.ts` using the existing `RunbookEntry` shape:
- `runbookId: "RB-005-AUTH"`, severity `critical`, subsystem `payments-auth`
- `killSwitchRef: "KS-PAYMENTS-AUTH"`, `boundedContextId: "finance-os"`
- `markdownRef: "docs/runbooks/payment-auth-3ds-recovery.md"`
- 5 steps (verify 3DS provider, drain auth queue, replay tokenized captures, validate SCA challenges, restore)

Add `payments-auth` to `runbook-subsystem-map.ts` as mandatory + criticalIncidentClass.

Create the markdown narrative `docs/runbooks/payment-auth-3ds-recovery.md`.

### Step 2 — Author the 5 operator narratives explicitly required by audit P1.3

Create new files under `docs/runbooks/`:
- `kill-switch.md` — index of all 14 kill switches with arm/disarm decision tree, dual-approval flow, links to per-switch runbooks
- `ai-fallback.md` — provider-chain fallback narrative (cross-references RB-002, RB-011)
- `recovery-mode.md` — boot-into-recovery operator script (cross-references `os/recovery/`)
- `support-bundle.md` — operator narrative wrapping `os/scripts/generate-support-bundle.sh` (closes the audit's "support-bundle gate produces evidence but no operator narrative" finding)
- `evidence-purge.md` — purge-with-attestation walkthrough (links to `evidence-purge-audit` gate)

Each follows the canonical structure: **Trigger → Signal → Response steps → Escalation → Rollback → Verification**.

### Step 3 — Wire `check-runbook-coverage` into the master release roster

Add `"runbook-coverage"` to `MANDATORY_BLOCK_GATES` in `scripts/architecture/checks/check-os-release-readiness.ts` (becomes gate #25 after the artifact-index gate).  
Register in `src/lib/ci/ci-gate-registry.ts` as block-tier.  
Add npm script `check:runbook-coverage` in `package.json` if missing.

### Step 4 — Regenerate runbook index manifest

Re-run `scripts/support/runbooks/generate-runbook-index.ts` so `generated/runbook-index.json` reflects the +1 RB-005-AUTH entry and 5 new narratives. Mirror to `public/generated/runbook-index.json`.

### Step 5 — Verify gate green

```bash
npx tsx scripts/architecture/checks/check-runbook-coverage.ts
# expect: ✅ 22 runbooks, 21/20 subsystems covered, 0 errors
npm run release:readiness
# expect: 25/25 mandatory BLOCK gates green
```

### Step 6 — Update all 4 audit mirrors to RESOLVED 2026-04-20

Update `public/generated/MISSING_AUDIT.md`, `/mnt/documents/MISSING_AUDIT.md`, `public/generated/MISSING_AUDIT_v2.md`, `/mnt/documents/MISSING_AUDIT_v2.md` at every runbook reference (lines 75, 110, 125, 600, 606, 865, 1130, 1140, 1154, 1359-1366) with marker:

`**RESOLVED 2026-04-20** — docs/runbooks/ contains 34 narratives (29 pre-existing + 5 audit-mandated: kill-switch, ai-fallback, recovery-mode, support-bundle, evidence-purge). RUNBOOK_REGISTRY (src/lib/support/runbook-registry.ts) has 22 entries linking each to markdownRef + killSwitchRef + boundedContextId. RB-005-AUTH dangling reference resolved. check-runbook-coverage is BLOCK gate #25 in master release roster, asserts mandatory subsystem coverage + markdown existence + bounded-context resolution + bidirectional kill-switch ↔ runbook linkage. Mirror parity preserved via md5sum.`

Preserve byte-identical mirror parity.

## Files touched

**New (6):**
- `docs/runbooks/payment-auth-3ds-recovery.md`
- `docs/runbooks/kill-switch.md`
- `docs/runbooks/ai-fallback.md`
- `docs/runbooks/recovery-mode.md`
- `docs/runbooks/support-bundle.md`
- `docs/runbooks/evidence-purge.md`

**Modified (8):**
- `src/lib/support/runbook-registry.ts` (+1 entry RB-005-AUTH)
- `src/lib/support/runbook-subsystem-map.ts` (+1 subsystem `payments-auth`)
- `src/lib/support/runbook-types.ts` (+1 union member `"payments-auth"`)
- `scripts/architecture/checks/check-os-release-readiness.ts` (roster +1 → 25 gates)
- `src/lib/ci/ci-gate-registry.ts` (gate #25 entry)
- `package.json` (npm script if missing)
- `generated/runbook-index.json` + `public/generated/runbook-index.json` (regenerated)
- 4 audit mirrors (MISSING_AUDIT.md / v2 × 2 locations)

## What this does NOT touch

- Zero changes to existing 29 runbook narratives
- Zero changes to existing 21 runbook registry entries
- Zero changes to existing 14 kill switches (only the dangling ref is now satisfied by a real entry)
- No runtime behavior changes — pure documentation + registry + gate-roster work

