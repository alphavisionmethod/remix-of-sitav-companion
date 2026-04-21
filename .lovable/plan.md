

## Wave 15 — Database Governance Layer

### Summary

The project has a strong canonical DB truth layer in `src/lib/db/` (13 files: schema-registry, rls-policy-registry, migration-registry, tenancy-boundary-map, table-ownership-map, db-truth-registry, db-audit-registry, db-runtime-consequence-map, db-dependency-map, db-health-engine, table-writer-reader-map, non-edge-table-io-sources, cross-domain-write-exemptions). What is missing: table classification (state vs event vs audit vs receipt), retention/TTL governance, index coverage audit, query-plan baselines, bounded-context map artifact, support-view registry, repair-procedure map, partition strategy, and policy-pattern audit. The existing `scripts/db/checks/check-index-and-retention-coverage.ts` is a stub that writes a hardcoded JSON.

This wave extends the existing `src/lib/db/` canonical system with governance registries and replaces stubs with real validators. No second DB governance platform.

---

### Phase A — Table Classification and Bounded-Context Map (3 files)

**1. `src/lib/db/table-classification-map.ts`**
- Imports `DB_SCHEMA_REGISTRY` and classifies every table into: `lifecycle-state`, `event-ledger`, `append-only-audit`, `receipt-proof`, `projection-read-model`, `control-plane-config`, `support-debug`, `cache-temporary`, `ttl-governed`, `queue-retry`
- Uses existing `schemaClass` (write/read/log/config/system) as input signal plus table naming conventions (e.g., `*_receipts` = receipt-proof, `*_audit` = append-only-audit, `*_logs` = event-ledger)
- Exports `TABLE_CLASSIFICATION_MAP: Record<string, TableClassification>`

**2. `src/lib/db/bounded-context-map.ts`**
- Thin projection from `DB_SCHEMA_REGISTRY` + `DOMAIN_TO_OWNER` + `TABLE_CLASSIFICATION_MAP`
- Exports `BOUNDED_CONTEXT_MAP` with per-table: `tableName`, `boundedContext` (= domain), `owner`, `tableRole`, `classification`, `retentionCategory`, `supportImportance`
- Generates `generated/db-bounded-context-map.json` via generator script

**3. `src/lib/db/schema-authority-registry.ts`**
- Extends `DB_TRUTH_REGISTRY` with full authority typing per table
- Each entry: `table`, `authorityType` (source-of-truth | derived | event | append-only-audit | receipt | queue | support | config), `criticality`, `tenantScope`, `rlsRequired`, `lifecycleExpectation`
- Covers all tables in `DB_SCHEMA_REGISTRY`, cross-referencing `DB_TRUTH_REGISTRY` for concept mapping
- Generates `generated/db-authority-map.json`

### Phase B — Retention, TTL, Hot/Cold, and Partition Governance (3 files)

**4. `src/lib/db/retention-policy-registry.ts`**
- Extends existing `DB_AUDIT_REGISTRY` retention data to all table families
- Per-table: `retentionClass` (permanent | long-term-7yr | medium-1yr | short-90d | transient-30d | session), `archivePolicy` (append-only | soft-delete | hard-delete | ttl-purge), `purgeRules`, `ttlColumn` if applicable, `expectedRowGrowth` (low | medium | high | very-high), `hotCold` (hot | warm | cold)
- Generates `generated/db-retention-policy-matrix.json` and `generated/db-hot-cold-data-map.json`

**5. `src/lib/db/ttl-governance-map.ts`**
- Scans `DB_SCHEMA_REGISTRY` for tables with known TTL patterns (expires_at, cooldown_expires_at, scheduled_purge_at, muted_until)
- Declares TTL column, expected cleanup mechanism, index requirement
- Generates `generated/db-ttl-governance-report.json`

**6. `src/lib/db/partitioning-strategy-map.ts`**
- Per high-growth table family: partition recommendation or explicit non-partition rationale
- Covers: timeline_events, audit_logs, ai_inference_receipts, sync_logs, tenant_firewall_logs, ai_workforce_invocations
- Generates `generated/db-partition-strategy-report.json`

### Phase C — Index and Query-Plan Governance (2 files)

**7. `src/lib/db/index-coverage-registry.ts`**
- Declares expected indexes per table family: FK indexes, TTL/expires_at indexes, status/workflow columns, composite operational patterns
- Flags missing indexes as governance gaps
- Generates `generated/db-index-coverage.json` (replaces current stub output)

**8. `src/lib/db/query-plan-governance.ts`**
- Declares critical query families (auth lookup, onboarding resume, app install, advisor lookup, boardroom item, payment receipt, connector health, file lineage, kill-switch, support bundle)
- Per query family: expected table, required index support, high-risk scan patterns, structural prerequisites
- Generates `generated/db-query-plan-baseline.json`

### Phase D — Policy Pattern and Tenant Isolation (2 files)

**9. `src/lib/db/policy-pattern-registry.ts`**
- Standardizes the 12 `RlsPattern` types from `rls-policy-registry.ts` into canonical pattern contracts
- Per pattern: description, expected USING clause shape, expected WITH CHECK shape, applicable table classes, security requirements
- Audits all tables for pattern consistency
- Generates `generated/db-policy-pattern-audit.json`

**10. `src/lib/db/tenant-isolation-map.ts`**
- Extends `TENANCY_BOUNDARY_MAP` with isolation proof metadata
- Per tenant-scoped table: isolation mechanism, policy mechanism, actor classes, support override path, evidence source
- Generates `generated/db-tenant-isolation-proof.json`

### Phase E — Support, Repair, and Migration Governance (3 files)

**11. `src/lib/db/support-view-registry.ts`**
- Declares support/debug data access patterns for critical workflows
- Per workflow: tables involved, join pattern, key filters, operator access level, redaction rules
- Covers: auth/session, onboarding, app install, advisor/boardroom, payment, connector, file, kill-switch, support bundle
- Generates `generated/db-support-views-map.json`

**12. `src/lib/db/data-repair-procedure-map.ts`**
- Per critical domain: repairable failure types, repair procedure ID, manual vs automated, preconditions, audit requirements, rollback safety, runbook linkage
- Covers: stuck workflows, orphaned installs, broken permissions, receipt mismatch, connector token cleanup, session corruption, queue repair
- Generates `generated/db-repair-procedure-coverage.json`

**13. Generator: `scripts/db/generate/generate-db-governance-artifacts.ts`**
- Single script that imports all new registries and generates all 15 artifacts into `generated/`
- Generates: db-bounded-context-map.json, db-authority-map.json, db-table-classification.json, db-retention-policy-matrix.json, db-hot-cold-data-map.json, db-ttl-governance-report.json, db-partition-strategy-report.json, db-index-coverage.json, db-query-plan-baseline.json, db-policy-pattern-audit.json, db-tenant-isolation-proof.json, db-support-views-map.json, db-repair-procedure-coverage.json, db-schema-ownership-map.json, db-migration-governance-report.json

### Phase F — Validators (9 scripts)

Replace the existing stub `check-index-and-retention-coverage.ts` and add 8 new validators:

**14. `scripts/db/checks/check-db-authority-map.ts`** -- BLOCK. Verify every table has authority classification, owner, and context.

**15. `scripts/db/checks/check-db-index-coverage.ts`** -- REPLACE existing stub. Real validation: TTL columns indexed, FK indexes present, high-volume tables covered.

**16. `scripts/db/checks/check-db-retention-and-ttl.ts`** -- ADVISORY. Verify retention/TTL/hot-cold declared for key families.

**17. `scripts/db/checks/check-db-query-plan-prereqs.ts`** -- ADVISORY. Verify critical query families have structural prerequisites.

**18. `scripts/db/checks/check-db-policy-patterns.ts`** -- ADVISORY. Verify RLS policies match canonical patterns.

**19. `scripts/db/checks/check-db-tenant-isolation.ts`** -- BLOCK. Verify tenant-scoped tables declare isolation and policy coverage.

**20. `scripts/db/checks/check-db-support-view-coverage.ts`** -- ADVISORY. Verify critical workflows have support/debug visibility.

**21. `scripts/db/checks/check-db-repair-coverage.ts`** -- ADVISORY. Verify critical repair procedures declared.

**22. `scripts/db/checks/check-db-migration-governance.ts`** -- ADVISORY. Verify migrations map to contexts and risky churn surfaced.

### Phase G — Barrel Export and Gate Registration

- Update `src/lib/db/index.ts` to export all new registries
- Register `db-authority-map` and `db-tenant-isolation` as BLOCK gates in `check-os-release-readiness.ts`
- Register 7 ADVISORY gates for remaining validators
- `npx tsc --noEmit` -- zero errors
- Run all 9 new validators -- all green

### No-Duplication Enforcement

- All new registries import from existing `DB_SCHEMA_REGISTRY`, `DOMAIN_TO_OWNER`, `TENANCY_BOUNDARY_MAP`, `RLS_POLICY_REGISTRY`, `DB_AUDIT_REGISTRY`, `DB_TRUTH_REGISTRY` -- no second schema registry
- `check-db-index-coverage.ts` replaces existing stub `check-index-and-retention-coverage.ts`
- `schema-authority-registry.ts` extends `DB_TRUTH_REGISTRY` -- no second truth system
- `retention-policy-registry.ts` extends `DB_AUDIT_REGISTRY` retention data -- no second audit system

### Deployment Closure Checklist

- [ ] All ~420 tables classified (state/event/audit/receipt/config/support)
- [ ] Bounded-context map covers all tables with owner and role
- [ ] Authority registry with criticality and lifecycle for all tables
- [ ] Retention/TTL/hot-cold governance for all table families
- [ ] Index coverage audit with TTL and FK gap detection
- [ ] Query-plan baselines for 11 critical query families
- [ ] Policy pattern standards for all 12 RLS patterns
- [ ] Tenant isolation proof for all tenant-scoped tables
- [ ] Support-view registry for 9 critical workflows
- [ ] Repair procedure map for 7 critical domains
- [ ] Migration governance report for 233 migrations
- [ ] 15 generated proof artifacts
- [ ] 9 validator scripts passing (2 BLOCK + 7 ADVISORY)
- [ ] TypeScript builds with 0 errors
- [ ] No duplicate DB governance systems

