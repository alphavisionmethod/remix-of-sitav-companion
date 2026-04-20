

## Wave 9 — Verdict Logic Fix (YELLOW → GREEN)

### What's actually wrong

The 3 reports from §1.4 (`runbook-coverage-report.json`, `connector-client-registry-completeness-report.json`, `admin-runbook-surface-wiring-report.json`) all exist on disk and report `ok: true` with 0 errors. The aggregator's own `ok` field is already `true`. The system is **already deployment-ready**.

The verdict shows YELLOW instead of GREEN due to a single bug in the aggregator's verdict formula:

```text
Line 547 comment: "BLOCK verdict — derived ONLY from REQUIRED_GATES. Advisory state is informational."
Line 549-554 code:  verdict = (errors > 0 || missing > 0) ? "RED" : totalWarnings > 0 ? "YELLOW" : "GREEN"
```

The formula counts 4,252 advisory/mobile/admin warnings toward the verdict string, contradicting its own documented intent. The `ok: true` field is correct, but the human-readable `verdict: "YELLOW"` is wrong.

### Fix (single file, 6-line change)

**File:** `scripts/architecture/checks/check-os-release-readiness.ts`

Change the verdict formula (lines 549-554) to only consider BLOCK-gate warnings for the verdict, matching the documented intent:

```typescript
// Count only BLOCK-gate warnings (exclude advisory, mobile, admin warn-tier)
const blockWarnings = totalWarnings - advisoryWarnings - mobileWarnings - adminAIEngineerWarnings;

const verdict: AggregateReport["verdict"] =
  missingGates.length > 0 || totalErrors > 0
    ? "RED"
    : blockWarnings > 0
      ? "YELLOW"
      : "GREEN";
```

This preserves `totalWarnings` in the report for visibility but stops advisory noise from polluting the deployment verdict.

### Re-generate reports

After the fix, re-run the aggregator to produce updated:
- `generated/os-release-readiness-report.json` — verdict flips to `GREEN`
- `generated/os-release-readiness-summary.md` — human-readable summary shows GREEN

### Update MASTER_AUDIT.md

Refresh `public/generated/MASTER_AUDIT.md` and its mirror at `public/generated/artifacts/audits/MASTER_AUDIT.md` to reflect the GREEN verdict and document that advisory warnings are informational-only per the framework's own design.

### Files to edit
- `scripts/architecture/checks/check-os-release-readiness.ts` (verdict formula fix)
- `generated/os-release-readiness-report.json` (re-generated)
- `generated/os-release-readiness-summary.md` (re-generated)
- `public/generated/MASTER_AUDIT.md` (verdict refresh)
- `public/generated/artifacts/audits/MASTER_AUDIT.md` (mirror)

### What this delivers
- Verdict flips from **YELLOW → GREEN**
- `ok: true` already correct — no behavioral change
- 248/248 BLOCK gates remain GREEN, 0 errors, 0 missing
- Advisory warnings (4,252) remain visible in the report but no longer misrepresent deployment readiness
- The aggregator's code matches its own documented contract

