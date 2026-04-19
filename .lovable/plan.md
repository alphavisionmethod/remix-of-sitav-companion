

## Diagnosis

The codebase is fully wired and correct. The **document** `MASTER_REMEDIATION_BLUEPRINT_v2.md` (and its mirror in `public/generated/`) contains **fabricated paths and gate names** that don't match the real implementation. That mismatch is the only "issue remaining" — fixing the doc to reflect reality is the deployment-readiness fix.

### Real codebase state (verified)

| Claim in doc | Reality |
|---|---|
| `scripts/validators/*.ts` (19 files) | ❌ Directory does not exist |
| `scripts/aggregator/master-remediation-aggregator.ts` | ❌ File does not exist |
| 19 BLOCK gates wired | ✅ All 19 wired, but in `scripts/architecture/checks/check-os-release-readiness.ts` lines 276–298 |
| 19 validators exist | ✅ All exist, but as `scripts/architecture/checks/check-<gate>.ts` |
| Generated reports per gate | ✅ All 19 `generated/<gate>-report.json` files present |

### Gate-name corrections needed in doc

| Doc says (wrong) | Aggregator registers (real) |
|---|---|
| `evidence-persistence` | `evidence-graph-completeness` |
| `release-graph-evidence` | `release-evidence-graph-snapshot` |
| `owner-copilot-sessions` | `owner-copilot-readonly` |
| `federation-optin-coverage` | `federation-optin-append-only` |
| `dr-drill-execution` | `dr-drill-evidence` |
| `chaos-drill-results` | `chaos-drill-classification` |
| `production-launch-attestations` | `production-launch-attestation` |
| `boardroom-tab-engagement` | `boardroom-cockpit-telemetry` |
| `onboarding-branch-coverage` | `onboarding-branch-telemetry` |
| Several Phase 0–9 names | See aggregator lines 276–286 for canonical list |

## Plan: Rewrite blueprint to match reality (doc-only, zero code changes)

### Step 1 — Rewrite `MASTER_REMEDIATION_BLUEPRINT_v2.md`

Replace fabricated paths/names with verified ones:
- All validator paths → `scripts/architecture/checks/check-<gate>.ts`
- Aggregator path → `scripts/architecture/checks/check-os-release-readiness.ts`
- All 19 gate names corrected to match the `REQUIRED_GATES` array (lines 276–298)
- Add a "Verification" section showing exact `npx tsx` command per validator + the `npm run release:readiness` aggregator command
- Add a "Verified Against Codebase" footer with the file paths inspected

### Step 2 — Mirror to `public/generated/MASTER_REMEDIATION_BLUEPRINT_v2.md`

Identical content, so the in-app reader and the document download stay in sync.

### Step 3 — Add a one-page `MASTER_REMEDIATION_VERIFICATION_v2.md`

Lists each of the 19 gates with:
- Real validator file path
- Real generated report path
- Real aggregator line number reference
- Run command

This becomes the "deployment evidence" companion to the blueprint.

### What I will NOT change

- No new tables, no new edge functions, no new validators — the implementation is complete and green.
- No edits to `check-os-release-readiness.ts` — it's already correctly wired.
- No edits to `master-remediation-progress.json` — already reflects GREEN.

### Output artifacts

- `/mnt/documents/MASTER_REMEDIATION_BLUEPRINT_v2.md` (rewritten, accurate)
- `public/generated/MASTER_REMEDIATION_BLUEPRINT_v2.md` (mirror)
- `/mnt/documents/MASTER_REMEDIATION_VERIFICATION_v2.md` (new evidence companion)
- `public/generated/MASTER_REMEDIATION_VERIFICATION_v2.md` (mirror)

After approval, the docs will accurately reflect the already-deployment-ready codebase, with zero broken path references.

