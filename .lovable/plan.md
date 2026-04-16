

# Implement 8 Missing Registry Files + Barrel Exports

## Status: 8 of 16 files are truly missing

| File | Status |
|------|--------|
| `src/lib/runtime/product-reality-tiers.ts` | EXISTS |
| `src/lib/runtime/runtime-capability-matrix.ts` | EXISTS |
| `src/lib/runtime/runtime-message-registry.ts` | **MISSING** |
| `src/lib/runtime/service-lifecycle-registry.ts` | **MISSING** |
| `src/lib/storage/storage-topology-registry.ts` | **MISSING** |
| `src/lib/surfaces/surface-runtime-registry.ts` | EXISTS |
| `src/lib/devices/device-capability-registry.ts` | EXISTS |
| `src/lib/devices/device-trust-registry.ts` | EXISTS |
| `src/lib/security/runtime-trust-chain.ts` | **MISSING** |
| `src/lib/deployment/deployment-unit-registry.ts` | EXISTS |
| `src/lib/backend-topology/edge-function-registry.ts` | EXISTS |
| `src/lib/db/schema-registry.ts` | EXISTS |
| `src/lib/policy/unified-policy-matrix.ts` | **MISSING** |
| `src/lib/control-plane/kill-switch-registry.ts` | **MISSING** |
| `src/lib/support/runbook-registry.ts` | **MISSING** |
| `src/lib/journeys/golden-path-registry.ts` | **MISSING** |

Supabase directories (`schema/`, `policies/`, `seed/`, `docs/`) already exist with READMEs.

## What Will Be Created

### 8 New Registry Files

1. **`src/lib/runtime/runtime-message-registry.ts`** — Typed system message catalog (boot, crash, lifecycle, security events) with severity, audience, and remediation. Imports from existing `product-reality-tiers.ts` types.

2. **`src/lib/runtime/service-lifecycle-registry.ts`** — Maps all ~45 canonical services with lifecycle states (boot-order, dependencies, restart policy, health-check interval). Cross-references `os-security` daemons and `core-services`.

3. **`src/lib/storage/storage-topology-registry.ts`** + barrel `index.ts` — Maps storage backends (Supabase, IndexedDB, localStorage, NovaFS, cloud-storage bucket) with replication topology, encryption, and quota. New directory.

4. **`src/lib/security/runtime-trust-chain.ts`** + barrel `index.ts` — Trust chain validation for 7 trust zones (A-G from security-fabric memory). Links to `os-security/types.ts` role system and `device-trust-registry`. New directory.

5. **`src/lib/policy/unified-policy-matrix.ts`** + barrel `index.ts` — Cross-domain policy matrix unifying RLS policies, os-security policyd bundles, admin permissions, and advisor autonomy levels. New directory.

6. **`src/lib/control-plane/kill-switch-registry.ts`** + barrel `index.ts` — Kill switch definitions for 10 subsystems (advisors, outbound comms, connectors, sync, payments, mobile push, model providers, workflow, simulations, automations). New directory.

7. **`src/lib/support/runbook-registry.ts`** + barrel `index.ts` — 10 runbook definitions (auth outage, provider outage, sync lag, stuck workflow, proof mismatch, drift, push failure, VMware boot, rollback, AI degradation). New directory.

8. **`src/lib/journeys/golden-path-registry.ts`** + barrel `index.ts` — 11 golden path journey definitions (first boot, sign-in, restore, connect CRM, recover leads, approve outbound, review proof, mobile approval, admin intervention, workflow replay, release review). New directory.

### 1 Barrel Export Addition

- **`src/lib/runtime/index.ts`** — New barrel re-exporting all runtime files (product-reality-tiers, runtime-capability-matrix, runtime-flags, runtime-assertions, simulated-surface-registry, feature-tier-registry, + new message-registry and service-lifecycle).

### Wiring

- All files use `as const` readonly registries with typed interfaces and query functions
- Cross-imports only to existing typed contracts (`os-security/types`, `device-trust-registry`, `product-reality-tiers`)
- Each new directory gets a barrel `index.ts`
- No UI imports; pure data/type layer
- Follows exact patterns from `src/lib/devices/`, `src/lib/deployment/`, `src/lib/surfaces/`

### Total New Files: 14

| Type | Count |
|------|-------|
| Registry files | 8 |
| Barrel `index.ts` files | 6 (5 new dirs + runtime) |

