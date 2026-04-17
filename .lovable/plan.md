

## Re-Audit Verdict: DB / Migration Reality Checklist — 2 Residual Gaps

Phase 18 shipped the runner + report, but truth-check exposes:

### Gap A — No cross-domain exemption registry (item 16)
15 cross-domain writers are flagged as **warnings** with no governance. The check accepts `ok: true` despite real boundary crossings. There is no `CROSS_DOMAIN_WRITE_EXEMPTIONS` map declaring *why* each is allowed (admin BFF, seed fixture, gateway-by-design) and *what* the rationale is. This silently allows any new function to write outside its domain.

### Gap B — 127/201 tables have no declared writer or reader (items 3.b, 3.c)
Coverage is 74 tables (37%). Tables written via client SDK under RLS, RPC calls, or DB triggers (e.g., `profiles` via `handle_new_user` trigger, `org_members` via app code, all client-CRUD tables) have **no I/O entry**. The checklist requires "every critical table has writer(s), reader(s)" — 63% are unmapped.

---

## Phase 18.1 — DB Reality Closure (truthful 17/17)

### 18.1.A — Cross-Domain Write Exemption Registry
**New** `src/lib/db/cross-domain-write-exemptions.ts` (~120 LOC)
```ts
export type ExemptionReason =
  | "admin-bff-by-design"      // admin BFFs aggregate across domains
  | "gateway-by-design"        // gateways own their slice
  | "seed-fixture"             // dev/test seed only
  | "system-orchestrator"      // brain-core/self-healing system writes
  | "shared-audit-sink";       // multi-domain audit tables

export const CROSS_DOMAIN_WRITE_EXEMPTIONS: Record<string, {
  function: string;
  table: string;
  reason: ExemptionReason;
  rationale: string;
  reviewedBy: string;
  reviewedAt: string;
}[]> = { /* 15 entries, one per current offender */ };
```

Update `check-db-reality.ts` to:
- Match every cross-domain writer against exemption registry
- **Error** (not warning) if an unregistered cross-domain writer is found
- Pass only when `unexemptedCrossDomainWriters.length === 0`

### 18.1.B — Client + RPC + Trigger I/O Sources
**New** `src/lib/db/non-edge-table-io-sources.ts` (~200 LOC)
Declares the other write/read surfaces for every table not touched by an edge function:
```ts
export type TableIOSource =
  | { kind: "client-sdk"; component: string; auth: "rls-protected" }
  | { kind: "rpc"; function: string }
  | { kind: "trigger"; trigger: string; firedBy: string }
  | { kind: "view-only"; rationale: string }
  | { kind: "system-internal"; owner: string };

export const NON_EDGE_TABLE_IO: Record<string, {
  writers: TableIOSource[];
  readers: TableIOSource[];
}> = { /* covers remaining 127 tables */ };
```

Update `table-writer-reader-map.ts` to merge edge-fn I/O + non-edge I/O so every table has at least one declared writer or reader.

Update `check-db-reality.ts` to **error** when `tablesWithoutAnyIO > 0`.

### 18.1.C — Re-run + verify
- Regenerate `generated/db-reality-report.json` → expect `errorCount: 0, warningCount: 0, tablesWithoutAnyIO: 0`
- Re-run CI Umbrella → expect 29/29 still green with stricter gate
- Update `DbTruthExplorer.tsx` "Writers & Readers" tab to surface `nonEdgeWriters` (client-sdk / rpc / trigger badges) alongside edge-fn writers

### Files

| File | Change |
|---|---|
| `src/lib/db/cross-domain-write-exemptions.ts` | New (~120 LOC) |
| `src/lib/db/non-edge-table-io-sources.ts` | New (~200 LOC) |
| `src/lib/db/table-writer-reader-map.ts` | Merge non-edge sources |
| `scripts/architecture/checks/check-db-reality.ts` | Stricter: 0 unexempted + 0 unmapped |
| `src/pages/admin/DbTruthExplorer.tsx` | Show non-edge I/O badges |
| `generated/db-reality-report.json` | Regenerate clean |
| `src/lib/db/index.ts` | +2 barrel exports |

### Acceptance

- `db-reality-report.json` → `errorCount: 0, warningCount: 0, tablesWithoutAnyIO: 0, unexemptedCrossDomainWriters: 0`
- Every one of 201 tables has ≥1 declared writer or reader (edge-fn, client-sdk, rpc, trigger, or view-only with rationale)
- Every cross-domain writer has a registered exemption with reason + rationale + reviewer
- CI Gate 29 errors (not warns) on any new unregistered cross-domain writer or unmapped table
- Checklist item 3.b/3.c/16 truthfully ready — no "honest partial" remains

