
# ATLAS Closure & Platform Truth Hardening

## Phase 1 — Truth Infrastructure (DB + Core Services)
1. **DB Migration**: Create platform truth tables:
   - `platform_projection_states` — tracks every projection's freshness, source, confidence, staleness
   - `platform_mutation_receipts` — universal receipt for any admin/operator mutation
   - `platform_health_snapshots` — point-in-time system health materialization
   - `platform_degraded_states` — active degradation records with reason/scope
   - `platform_launch_gates` — evidence-backed launch readiness gates
   - `platform_truth_sync_log` — generated artifact synchronization tracking
2. **Truth metadata service** — service that tracks projection freshness, staleness thresholds, degraded state

## Phase 2 — Operator Truth Dashboard (Mission Control)
3. **Platform Truth Dashboard** — new Mission Control tab showing:
   - All projection states with freshness/staleness indicators
   - Active degraded states across services
   - Mutation receipt coverage percentage
   - Proof chain integrity status
   - Launch gate evidence status
   - Connector health control plane
4. **Inline truth indicators** — reusable components:
   - `<TruthBadge>` — shows freshness, source, confidence on any data surface
   - `<DegradedStateBanner>` — shows when surface is rendering partial/stale truth
   - `<StalenessIndicator>` — time-since-refresh with threshold coloring

## Phase 3 — Audit & Proof Closure
5. **Universal mutation audit** — ensure all admin mutations flow through audit ledger
6. **Proof matrix dashboard** — visual coverage map of which capabilities have receipts
7. **Replay verification surface** — timeline view of cross-service action reconstruction

## Phase 4 — Deployment & Launch Truth
8. **Launch ring gating** — evidence-backed promotion gates with pass/fail status
9. **Connector control plane** — health scoring, staleness detection, circuit breaker status
10. **Observability runbook surface** — operational runbooks with execution tracking

## Phase 5 — Testing & Verification
11. **Platform verification expansion** — architecture check results surfaced in Mission Control
12. **Generated truth sync** — validation that generated manifests match source reality
