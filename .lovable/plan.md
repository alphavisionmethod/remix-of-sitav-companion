

## Diagnosis

The audit finding is **real and material**:

- **186 edge functions on disk** (`supabase/functions/`)
- **`edge-function-owner-map.ts`**: only 85 entries → **101 functions have NO owner team**
- **`edge-function-registry.ts`**: only 88 entries (out of strict 11-field topology requirement)
- **`edge-function-authority-map.ts`**: only 87 entries (auth class + risk tier)
- **No single canonical ownership manifest** ties function → owner team → bounded context → on-call rotation
- Existing `check-edge-function-ownership.ts` checks authority map but is **not** in the master release roster, so 99 missing entries don't block deploy

The 101 unowned functions span every critical domain: app platform (app-install, app-uninstall, app-launch-resolve), agent runtime (16 internal-agent-*), boardroom telemetry, security (kill-switch-state, kill-switch-toggle, secret-rotation-orchestrator), evidence (evidence-graph-builder, attestation-packet-builder), webhooks (webhook-ingest/process/replay/retry), workflows, alerts, health probes, etc.

## Fix — single canonical ownership manifest, full coverage, blocking gate

### Step 1 — Backfill `edge-function-owner-map.ts` to 100% coverage (186/186)

Add the **101 missing entries** to `EDGE_FUNCTION_OWNER_MAP`, classified by domain inspection:

| Owner team | Functions added |
|---|---|
| `agent-runtime` | 16 internal-agent-* + agent-* gaps |
| `app-platform` (NEW union member) | app-install, app-uninstall, app-launch-resolve, app-manifest-*, app-permissions-sync, app-screenshot-capture, app-store-catalog, app-update-check, app-ingest-pwa, app-ingest-web, package-verify, desktop-update-manifest, os-update-manifest |
| `compliance-security` | account-delete, audit-export-bundler, audit-log-export, evidence-graph-builder, attestation-packet-builder, security-*, secret-rotation-orchestrator, webauthn-challenge, kill-switch-state, kill-switch-toggle, runbook-drill, dr-drill-*, canary-chaos-cron, compliance-evidence-*, release-artifact-signer/verifier, release-evidence-graph-snapshot, mobile-deferral-attestor, production-launch-attestor, federated-knowledge-aggregator |
| `notification-services` | alert-actions, alert-ingest, alert-route, alert-router |
| `platform-core` | health-beat, health-cron, health-live, health-ready, error-ingest, crash-report-ingest, trace-ingest, uptime-rollup, cron-receipt-collector, data-cleanup, data-export, prompt-versioning, routing-policy-update, oauth-refresh-probe, webhook-ingest, webhook-process, webhook-replay, webhook-retry-processor, workflow-execute, workflow-repair, workflow-replay, workflow-stuck-detector, tenant-self-service-bff, external-workforce-api, external-workforce-webhook-dispatcher |
| `ai-engineering` | ai-receipt-completeness-snapshot, ai-runtime-nightly-verify |
| `connector-integrations` | connector-reauth-tracker, connector-refresh-nightly-verify, connector-token-refresh |
| `user-experience` | boardroom-* (5), onboarding-branch-tracker, onboarding-resume-checkpoint, owner-copilot-bff, owner-copilot-session-tracker, seed-advisor-registry, seed-connector-registry |

Add new union member `"app-platform"` to `OwnerTeam`. Result: **186/186 ownership coverage**.

### Step 2 — Add per-function metadata fields to ownership manifest

Upgrade `EDGE_FUNCTION_OWNER_MAP` from `Record<string, OwnerTeam>` to a richer per-function ownership object that fully closes the audit finding ("Per-edge-function ownership manifest"):

```ts
interface EdgeFunctionOwnership {
  ownerTeam: OwnerTeam;
  primaryContact: string;        // GitHub team handle
  escalationContact: string;     // PagerDuty / on-call rotation
  slackChannel: string;          // #team-channel
  runbookRef: string | null;     // RB-XXX from runbook-registry
  killSwitchRef: string | null;  // KS-XXX from kill-switch-registry (if applicable)
  reviewerCodeOwners: string;    // CODEOWNERS pattern
}
```

Backwards-compat helper `getOwnerForFunction()` returns just the team string. New helper `getOwnershipManifestEntry(name)` returns the full record.

### Step 3 — Generate the canonical machine-readable ownership manifest

New script `scripts/manifests/generate/generate-edge-function-ownership-manifest.ts` writes:
- `generated/edge-function-ownership.json` (canonical)
- `public/generated/edge-function-ownership.json` (mirror for external probes)

Schema: `{ generatedAt, totalFunctions, totalOwners, coveragePercent, ownersByTeam, entries: [{ name, path, ownerTeam, primaryContact, escalationContact, slackChannel, runbookRef, killSwitchRef }] }`.

### Step 4 — Promote ownership check to BLOCK gate #26

New gate script `scripts/architecture/checks/check-edge-function-ownership-completeness.ts` asserts:
1. Every function in `supabase/functions/` (excluding `_shared`) has an entry in `EDGE_FUNCTION_OWNER_MAP`
2. Coverage = 100% (no orphans, no phantoms)
3. Each entry has non-empty `primaryContact`, `escalationContact`, `slackChannel`
4. Mirror parity (`generated/` ↔ `public/generated/`) via md5
5. Manifest freshness ≤ 7 days

Wire into:
- `scripts/architecture/checks/check-os-release-readiness.ts` → `MANDATORY_BLOCK_GATES` array (gate #26)
- `src/lib/ci/ci-gate-registry.ts` (block-tier entry)
- `package.json` scripts: `check:edge-function-ownership-completeness`, `generate:edge-function-ownership`

### Step 5 — Update CODEOWNERS file

Append per-edge-function patterns to `.github/CODEOWNERS` (or create one) so PR reviews automatically route to the owning team:

```
/supabase/functions/admin-*/         @sita/admin-governance
/supabase/functions/advisor-*/       @sita/advisor-intelligence
/supabase/functions/agent-*/         @sita/agent-runtime
/supabase/functions/app-*/           @sita/app-platform
/supabase/functions/boardroom-*/     @sita/user-experience
/supabase/functions/connector-*/     @sita/connector-integrations
/supabase/functions/internal-agent-*/ @sita/agent-runtime
... (all 12 owner teams)
```

### Step 6 — Verify gate green

```bash
npx tsx scripts/architecture/checks/check-edge-function-ownership-completeness.ts
# expect: ✅ 186/186 ownership coverage (100%), 12 owner teams, 0 orphans
npm run release:readiness
# expect: 26/26 mandatory BLOCK gates green
```

### Step 7 — Update audit mirrors to RESOLVED 2026-04-20

Update all four mirrors (`public/generated/MISSING_AUDIT.md`, `/mnt/documents/MISSING_AUDIT.md`, `public/generated/MISSING_AUDIT_v2.md`, `/mnt/documents/MISSING_AUDIT_v2.md`) at every reference to "Per-edge-function ownership" / "185 functions, no single ownership file" with marker:

`**RESOLVED 2026-04-20** — src/lib/backend-topology/edge-function-owner-map.ts now covers 186/186 functions (100%) across 12 owner teams (added 'app-platform' team + 101 backfilled entries). Per-function ownership manifest at generated/edge-function-ownership.json (mirrored to public/generated/) carries ownerTeam + primaryContact + escalationContact + slackChannel + runbookRef + killSwitchRef for every function. .github/CODEOWNERS routes PRs to owning teams. check-edge-function-ownership-completeness is BLOCK gate #26 in master release roster, asserts 100% coverage + mirror parity + freshness. Mirror parity preserved via md5sum.`

Preserve byte-identical mirror parity.

## Files touched

**New (3):**
- `scripts/manifests/generate/generate-edge-function-ownership-manifest.ts`
- `scripts/architecture/checks/check-edge-function-ownership-completeness.ts`
- `.github/CODEOWNERS` (or append if exists)

**Modified (5):**
- `src/lib/backend-topology/edge-function-owner-map.ts` (+101 entries, +1 owner team, richer schema)
- `scripts/architecture/checks/check-os-release-readiness.ts` (gate #26)
- `src/lib/ci/ci-gate-registry.ts` (gate registration)
- `package.json` (2 npm scripts)
- 4 audit mirrors (MISSING_AUDIT.md / v2 × 2 locations)

**Generated (2):**
- `generated/edge-function-ownership.json`
- `public/generated/edge-function-ownership.json`

## What this does NOT touch

- Zero changes to existing 85 owner entries (only additive)
- Zero changes to `edge-function-registry.ts` strict topology entries (separate audit item)
- Zero changes to `edge-function-authority-map.ts` (separate audit item)
- Zero runtime behavior changes — pure ownership-manifest + gate-roster work
- No edits to `supabase/functions/*/index.ts` files

