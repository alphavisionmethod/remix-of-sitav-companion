

# Security Architecture — Full Implementation Plan

## Current State Assessment

The codebase already has **substantial security infrastructure** (~3,100 lines across kernel modules):
- 5-ring sandbox engine, privilege enforcement, syscall dispatcher
- 3-layer capability-permission system (POSIX DAC + Linux Caps + SITA Tokens)
- Cryptographic subsystem (LUKS2, TPM, key hierarchy)
- Code signing and boot chain verification
- Stateful packet firewall with connection tracking
- Crash resilience with process watchdog
- Trust governor with score-based posture
- Security posture engine with threat model
- Self-healing immune controller

**What's missing** are the cross-cutting enforcement engines, the runtime security fabric, and the unified admin UI that ties it all together.

## Implementation — 5 Batches

### Batch 1: Detection and Monitoring Layer
**3 new files — the "eyes and ears" of the security system**

| File | What | Lines |
|---|---|---|
| `src/lib/core-services/security/intrusion-detection-engine.ts` | IDS: syscall anomaly detection, impossible-state detection, rate-spike detection, trust-downgrade triggers, quarantine actions, alert emission | ~300 |
| `src/lib/core-services/security/audit-trail-engine.ts` | Immutable append-only structured audit log with tamper-detection (hash chain), correlation IDs, before/after state, queryable history, export | ~250 |
| `src/lib/core-services/security/device-attestation-service.ts` | Device trust enrollment, boot integrity verification, remote attestation, device revocation, trust-state binding | ~200 |

### Batch 2: Enforcement and Governance Layer
**4 new files — the "immune system" that enforces boundaries**

| File | What | Lines |
|---|---|---|
| `src/lib/core-services/security/resource-governor.ts` | Per-app CPU/memory/FD/network budgets, enforcement actions (throttle/kill/alert), budget policies per trust ring, real-time metering | ~250 |
| `src/lib/core-services/security/zero-trust-validator.ts` | Request-level authn/authz enforcement, mTLS verification, scope validation, input schema validation, rate limiting per identity/device/session, policy evaluation | ~280 |
| `src/lib/core-services/security/ai-trust-enforcer.ts` | AI tool-call boundary enforcement, prompt input sanitization, capability scoping for AI actions, budget gate integration, model output validation, AI audit receipts | ~250 |
| `src/lib/core-services/security/human-factor-guard.ts` | Step-up auth triggers, blast-radius calculation, confirmation ceremony requirements, anti-fatigue rules, safe-default enforcement, emergency mode definitions | ~200 |

### Batch 3: Reliability and Resilience Layer
**3 new files — ensuring the system survives failures**

| File | What | Lines |
|---|---|---|
| `src/lib/core-services/security/event-consistency-engine.ts` | At-least-once delivery, idempotency keys, ordering guarantees, deduplication, dead-letter queue, replay support, consumer lag detection, correlation propagation | ~280 |
| `src/lib/core-services/security/update-safety-system.ts` | Pre-update validation (signatures, compatibility, space, battery), transactional apply with checkpoints, health gates, auto-rollback on threshold failure, A/B slot management | ~300 |
| `src/lib/core-services/security/chaos-testing-framework.ts` | Failure injection scenarios (service crash, network drop, storage latency, auth degradation, event duplication), execution harness, result verification, graceful-degradation assertions | ~250 |

### Batch 4: Integration Wiring
**2 files — connecting all subsystems into a unified security fabric**

| File | What | Lines |
|---|---|---|
| `src/lib/core-services/security/security-fabric.ts` | Master orchestrator that wires all 10+ security subsystems together: trust governor + IDS + audit + resource governor + zero-trust + AI enforcer + sandbox + capability system. Provides `SecurityFabric` class with unified `evaluateAction()`, `reportAnomaly()`, `getPosture()` | ~300 |
| `src/lib/core-services/security/index.ts` | Clean barrel export for all security modules | ~40 |
| `src/hooks/use-security-fabric.ts` | React hook exposing SecurityFabric to UI components | ~80 |

### Batch 5: Security Command Center UI
**1 major file — admin visualization surface**

| File | What | Lines |
|---|---|---|
| `src/pages/admin/SecurityCommandCenter.tsx` | 8-tab admin dashboard: Trust Boundaries (ring visualization), Capability Audit (active tokens, revocations), Intrusion Detection (live alerts, quarantine), Audit Trail (searchable log viewer), Resource Governor (per-app budget meters), Zero-Trust Monitor (request validation stats), AI Safety Dashboard (tool-call logs, budget usage), Update Safety (rollout health, rollback history) | ~500 |

**Also modify:**
- `src/pages/admin/index.tsx` — register SecurityCommandCenter route
- Route registry — add `/admin/security-command`

## Architecture Principles Enforced
- Every module is a standalone class with no circular dependencies
- All modules emit structured audit events to the AuditTrailEngine
- SecurityFabric is the single integration point — no module talks directly to another
- Trust rings from the existing SandboxEngine are reused, not duplicated
- Capability tokens from the existing CapabilityPermissionSystem are reused
- All AI enforcement delegates to the existing AI gateway constraint

## Total Scope
- **13 new files** created
- **2 existing files** modified
- **~3,280 lines** of new code
- **0 database migrations** needed (all runtime/simulated architecture)

