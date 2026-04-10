

# ATLAS Closure — Advanced Operational Enhancements Plan

## Audit Summary

After thorough codebase inspection, the 10 ATLAS areas listed in the spec **already have substantial implementations**. However, several pages need deepening from "good overview" to "fully advanced operational product." Here's what's genuinely thin vs solid:

### Already Solid (no changes needed)
- **Admin Durability Board** (278 LOC) — mutation provenance, write-path registry, lineage gaps, projection impact, receipts
- **Operations Command Center** (196 LOC) — service health, SLO burn rates, alert triage, incidents, queue lag, runbooks
- **Proof Coverage Board** (259 LOC) — 29 capabilities, chain explorer, replay/rollback verification
- **Connector Control Center** (200 LOC) — lifecycle FSM, health matrix, capability registry, audit timeline
- **Mission Control** (1301 LOC) — system pulse, agent cards, incidents, connectors, workflows, costs, policies, releases, safe mode
- **Owner Center** (2525 LOC) — pulse, approvals, AI team, timeline, service map, governance
- **Release/Deployment Workspace** (228 LOC) — ring promotion with evidence, canary, rollback

### Needs Enhancement (genuine gaps found)

| Area | Current | Gap |
|------|---------|-----|
| **DeploymentTruthCenter** (194 LOC) | Ring gates, environments, basic secrets | Missing: CI/CD pipeline integration, HA/DR checks detail, smoke/load gate evidence, secret rotation status, cert expiry monitoring |
| **DataProtectionPosture** (169 LOC) | Encryption domains, secret integrity | Missing: at-rest encryption coverage detail, key rotation schedules, sensitive data classification matrix, compliance mapping |
| **ProjectionControlCenter** (203 LOC) | 14 projections, freshness | Missing: rebuild/replay controls, fallback masking detail, materialization queue, honest staleness handling |
| **ValidationCommandCenter** (171 LOC) | Test counts, readiness | Missing: cross-domain E2E flow coverage, operational/admin test matrix, test run history, failure pattern analysis |
| **PlatformTruthRegistry** (178 LOC) | Manifest sync, claim verification | Missing: generated truth update workflows, manifest drift auto-detection, docs coverage scoring, architecture gate visibility |
| **ConciergeCommandCenter** (183 LOC) | Task continuity, travel, receipts | Missing: household continuity depth, task/travel/grocery state persistence verification, service provider SLA tracking |
| **AtlasHub** (77 LOC) | Simple nav grid | Missing: aggregate health score, cross-program dependency view, closure progress tracking |
| **LT02CIPipelineCenter** (128 LOC) | Basic CI/CD | Missing: smoke/load gate evidence, deployment artifact validation, VMware evidence link |

## Plan

### 1. Enhance DeploymentTruthCenter — add CI/CD truth, HA/DR, cert/secret monitoring
Add tabs for: CI Pipeline Status (build/test/deploy stages with evidence), HA/DR Readiness (replica status, failover testing, backup verification), Secret & Cert Health (rotation schedule, expiry warnings, integrity checks), Smoke/Load Gates (gate results with pass/fail evidence).

### 2. Enhance DataProtectionPosture — encryption at rest, key rotation, compliance
Add: at-rest encryption coverage per table/bucket, key rotation schedule with staleness indicators, sensitive data classification matrix (PII/financial/health), compliance mapping (SOC2/GDPR checklist items).

### 3. Enhance ProjectionControlCenter — rebuild controls, fallback masking, materialization
Add: rebuild/replay action buttons per projection, fallback masking audit (which projections serve fallback data), materialization queue with processing rates, staleness threshold configuration, honest degraded-state indicators per projection.

### 4. Enhance ValidationCommandCenter — E2E coverage, cross-domain, operational tests
Add: cross-domain E2E flow matrix (investment→receipt, revenue→automation, etc.), operational/admin test coverage grid, test run history timeline, failure pattern clustering, architecture gate compliance summary.

### 5. Enhance PlatformTruthRegistry — generated truth workflows, architecture gates
Add: manifest-truth sync workflows with diff view, auto-detection of docs/code drift, architecture gate visibility (which gates passed/failed for current build), generated truth file freshness tracking, claim verification automation status.

### 6. Enhance ConciergeCommandCenter — continuity depth, SLA tracking
Add: task/travel/household state persistence verification, service provider SLA compliance tracking, grocery/appointment data continuity checks, cross-module integration health (calendar↔tasks↔travel).

### 7. Enhance AtlasHub — aggregate health, closure tracking
Add: aggregate closure health score (weighted from all 10 programs), cross-program dependency graph, per-program progress bars, quick-action buttons for common operator workflows, recent closure activity feed.

### 8. Add OperationalInfraMonitor — cert expiry, replica lag, DB exhaustion, pool health
New page at `/atlas/infrastructure` covering: cert expiry countdown timers, database pool utilization and exhaustion warnings, replica lag monitoring, event bus lag, storage pressure, connection pool saturation. This is the missing "operational UX" layer.

## Files Changed

| File | Change |
|------|--------|
| `src/pages/atlas/DeploymentTruthCenter.tsx` | Add CI/CD, HA/DR, cert/secret, smoke/load tabs (~+200 LOC) |
| `src/pages/atlas/DataProtectionPosture.tsx` | Add encryption-at-rest, key rotation, compliance (~+180 LOC) |
| `src/pages/atlas/ProjectionControlCenter.tsx` | Add rebuild controls, fallback masking, materialization (~+160 LOC) |
| `src/pages/atlas/ValidationCommandCenter.tsx` | Add E2E matrix, cross-domain, test history (~+180 LOC) |
| `src/pages/atlas/PlatformTruthRegistry.tsx` | Add manifest workflows, arch gates, drift detection (~+170 LOC) |
| `src/pages/atlas/ConciergeCommandCenter.tsx` | Add continuity depth, SLA tracking (~+120 LOC) |
| `src/pages/atlas/AtlasHub.tsx` | Add health score, progress, dependency view (~+150 LOC) |
| `src/pages/atlas/OperationalInfraMonitor.tsx` (NEW) | Cert expiry, replica lag, DB pools, storage pressure (~250 LOC) |
| `src/lib/demo-data/atlas.ts` | Expand demo data for all new sections (~+200 LOC) |
| `src/App.tsx` | Add route for `/atlas/infrastructure` |

**Total: ~1 new file, ~9 files enhanced, ~1,600 net LOC added.**

## Technical Approach
- All enhancements use existing patterns: `DemoModeBadge`, `SitaPageHeader`, `DegradedStateBanner`, `StalenessIndicator`, `Tabs`, `Badge`, `Progress`, `Card`
- Demo data expanded in `atlas.ts` — no stubs, all interactive
- Every new section has actionable operator controls (rebuild, acknowledge, dismiss, drill-down)

