

## Wave 12.8 — Route-to-System Coherence Closure

### Summary

Formalize the existing route architecture into a fully coherent, deployment-ready system. The project has strong foundations: `route-registry.ts` (25 families), `route-plane-map.ts` (23 entries), `route-profile-map.ts` (11 entries), `route-runtime-map.ts` (8 entries), `context-membership-map.ts` (90+ route bindings), `admin-route-registry.ts` (136 admin routes, 12 domains), `page-owner-map.ts` (9 entries), and `layer-manifest.ts` (27 prefix-layer mappings). Missing: route intent taxonomy, route-to-backend mapping, route truth requirements, route support mapping, route observability mapping, route auth-capability matrix, dead/duplicate governance, and unified route metadata model. This wave fills every gap.

---

### PART 1 — Canonical Systems to Preserve and Extend

| System | Path | Action |
|---|---|---|
| Route Registry | `src/platform/architecture/route-registry.ts` | Extend `RouteEntry` with intent, tier, backend, truth, support, observability fields |
| Route Plane Map | `src/platform/architecture/route-plane-map.ts` | Extend entries to cover all 26+ route prefixes (currently 23) |
| Route Profile Map | `src/platform/architecture/route-profile-map.ts` | Extend from 11 entries to full coverage (~30 prefixes) |
| Route Runtime Map | `src/platform/architecture/route-runtime-map.ts` | Extend from 8 entries to full coverage (~30 prefixes) |
| Context Membership Map | `src/platform/architecture/context-membership-map.ts` | Keep as-is (90+ bindings, already comprehensive) |
| Admin Route Registry | `src/platform/architecture/admin-route-registry.ts` | Keep as-is (136 routes, 12 domains) |
| Page Owner Map | `src/platform/architecture/page-owner-map.ts` | Extend from 9 entries to ~30 critical pages |
| Layer Manifest | `src/platform/architecture/layer-manifest.ts` | Keep as-is (27 prefix-layer mappings) |
| ShellComposer | `src/runtimes/shell/ShellComposer.tsx` | Keep as-is — consumes route-plane-map |
| App.tsx route wiring | `src/App.tsx` | Keep as-is (16 route family imports, 3-tier structure) |

### PART 2 — Duplicate/Shadow Systems to Consolidate

No major duplicates. The layer-manifest `ROUTE_LAYER_MAP` and `ROUTE_PLANE_MAP` serve complementary purposes (6-layer classification vs 5-plane membership). Both stay.

Minor alignment needed:
- `route-profile-map.ts` has 11 entries vs `route-plane-map.ts` has 23. Sync coverage.
- `route-runtime-map.ts` has 8 entries vs 23+ actual prefixes. Sync coverage.
- `page-owner-map.ts` has 9 entries. Extend to match critical page count.

### PART 3 — New Canonical Artifacts

**New: `src/platform/architecture/route-intent-taxonomy.ts`**

Route intent classes:
- `LANDING`, `AUTH`, `ONBOARDING`, `USER_WORKSPACE`, `ADMIN_OPERATOR`, `OWNER_OVERRIDE`, `APP_PLATFORM`, `DESKTOP_OS`, `SETTINGS`, `INTEGRATION`, `SUPPORT`, `EXPERIMENTAL`, `SYSTEM_RECOVERY`, `INTERNAL_TOOLING`

Route tier classes:
- `PUBLIC`, `AUTHENTICATED`, `PRIVILEGED`, `OPERATOR_CRITICAL`, `SYSTEM_CRITICAL`, `EXPERIMENTAL`, `DEPRECATED`

Canonical `RouteMetadata` type unifying all dimensions:
- `routeId`, `path`, `prefix`, `family`, `intent`, `tier`, `plane`, `layer`, `owner`, `domain`
- `supportedRuntimes`, `degradedRuntimes`, `blockedRuntimes`
- `profiles`, `authRequired`, `requiredCapabilities`
- `shell`, `lazyEntry`, `pageSource`
- `backendSources`, `dataDependencies`, `truthPrimitives`
- `supportMapping`, `observabilityMapping`
- `deprecationStatus`, `evidence`

Master registry: `ROUTE_METADATA_REGISTRY` — ~30 entries covering all major route families with full metadata.

**New: `src/platform/architecture/route-backend-map.ts`**

Backend source types: `PUBLIC_BFF`, `ADMIN_BFF`, `DOMAIN_FUNCTION`, `ORCHESTRATION_FUNCTION`, `RUNTIME_SYSTEM`, `EXTERNAL_PROVIDER`, `STATIC`

Per-route-family mapping to primary backend sources and key edge functions/tables.

**New: `src/platform/architecture/route-truth-requirements.ts`**

Truth primitive types: `STATUS`, `PROVENANCE`, `EVIDENCE`, `AI_DISCLOSURE`, `TRUST_COPY`, `RECEIPT`, `PROOF_BUNDLE`

Per-route mapping declaring which truth primitives are required for trust-sensitive routes (boardroom, money, approvals, AI surfaces, connectors).

**New: `src/platform/architecture/route-support-map.ts`**

Per-route mapping to:
- Runbook reference (from existing runbook registry)
- Kill-switch relevance (from existing kill-switch registry)
- Escalation path (operator / engineering / external)
- Diagnostic entry point

**New: `src/platform/architecture/route-observability-map.ts`**

Per-route mapping to:
- Error reporting expectations (structured / best-effort / none)
- Telemetry hooks (page-view, action, latency)
- Admin diagnostic path

**New: `src/platform/architecture/route-auth-capability-map.ts`**

Per-route mapping to:
- Auth requirement (public / authenticated / admin / owner)
- Required capabilities/permissions
- Role requirement

**New: `src/platform/architecture/route-deprecation-registry.ts`**

Registry of deprecated routes with:
- Original path, replacement path, deprecation date, migration status

**New: `src/platform/architecture/route-dead-page-registry.ts`**

Registry tracking dead/orphaned pages found by check-dead-pages and check-route-drift validators.

### PART 4 — Extensions to Existing Files

**Extend: `src/platform/architecture/route-profile-map.ts`**

Add entries for all missing route families:
- `/business/*`, `/money/*`, `/concierge/*`, `/investment-office/*`, `/revenue-office/*`, `/digital-presence/*`, `/advisors/*`, `/apps/*`, `/communications/*`, `/experimental/*`, `/owner/*`, `/mobile/*`, `/onboarding`, `/first-win`, `/learn-later`

Increase from 11 to ~30 entries.

**Extend: `src/platform/architecture/route-runtime-map.ts`**

Add entries for all missing route families with explicit surface availability per runtime tier.

Increase from 8 to ~30 entries.

**Extend: `src/platform/architecture/page-owner-map.ts`**

Add entries for ~20 additional critical pages covering all major domain entry points.

**Extend: `src/platform/architecture/route-registry.ts`**

Add `intent` and `tier` fields to `RouteEntry` type. Add missing route families to `ROUTE_FAMILIES` (currently 25, target ~30).

### PART 5 — Generated Proof Artifacts

| Artifact | Contents |
|---|---|
| `generated/route-closure-matrix.json` | Updated — all routes with full metadata coverage status |
| `generated/route-runtime-compatibility.json` | Per-route runtime tier availability matrix |
| `generated/route-backend-wiring-audit.json` | Route-to-backend source mapping completeness |
| `generated/route-truth-coverage.json` | Truth primitive coverage for trust-sensitive routes |
| `generated/route-support-coverage.json` | Support/runbook/kill-switch mapping coverage |
| `generated/route-observability-coverage.json` | Observability hook coverage per route |
| `generated/route-dead-duplicate-report.json` | Dead routes, orphaned pages, duplicate prefixes |

### PART 6 — Validators and Gates

| Script | Gate ID | Level |
|---|---|---|
| `scripts/architecture/checks/check-route-metadata-closure.ts` | `route-metadata-closure` | BLOCK |
| `scripts/architecture/checks/check-route-backend-wiring.ts` | `route-backend-wiring` | ADVISORY |
| `scripts/architecture/checks/check-route-truth-coverage.ts` | `route-truth-coverage` | ADVISORY |
| `scripts/architecture/checks/check-route-support-linkage.ts` | `route-support-linkage` | ADVISORY |
| `scripts/architecture/checks/check-route-dead-duplicate-cleanup.ts` | `route-dead-duplicate-cleanup` | ADVISORY |
| `scripts/architecture/checks/check-route-observability-coverage.ts` | `route-observability-coverage` | ADVISORY |

Register `route-metadata-closure` as a BLOCK gate in `check-os-release-readiness.ts`.

### PART 7 — Implementation Phases

**Phase A** (Core contracts):
1. Create `route-intent-taxonomy.ts` with `RouteIntent`, `RouteTier`, and `RouteMetadata` types
2. Create `ROUTE_METADATA_REGISTRY` with ~30 fully-declared route family entries
3. Extend `RouteEntry` in `route-registry.ts` with `intent` and `tier` fields

**Phase B** (Coverage extensions):
4. Extend `route-profile-map.ts` from 11 to ~30 entries
5. Extend `route-runtime-map.ts` from 8 to ~30 entries
6. Extend `page-owner-map.ts` from 9 to ~30 entries

**Phase C** (Backend/truth/support/observability):
7. Create `route-backend-map.ts`
8. Create `route-truth-requirements.ts`
9. Create `route-support-map.ts`
10. Create `route-observability-map.ts`
11. Create `route-auth-capability-map.ts`

**Phase D** (Governance):
12. Create `route-deprecation-registry.ts`
13. Create `route-dead-page-registry.ts`

**Phase E** (Validators and proof):
14. Create 6 validator scripts
15. Generate 7 proof artifacts
16. Register BLOCK gate in release readiness aggregator

**Phase F** (Verification):
17. `npx tsc --noEmit` — zero errors
18. Verify no duplicate route metadata systems exist

### PART 8 — Deployment Closure Checklist

- [ ] One canonical `RouteMetadata` type with 20+ fields
- [ ] `ROUTE_METADATA_REGISTRY` with ~30 fully-declared entries
- [ ] Route intent taxonomy with 14 intent classes and 7 tier classes
- [ ] `route-profile-map.ts` covers all 30 route families
- [ ] `route-runtime-map.ts` covers all 30 route families
- [ ] `page-owner-map.ts` covers ~30 critical pages
- [ ] `route-backend-map.ts` maps all dynamic routes to backend sources
- [ ] `route-truth-requirements.ts` maps all trust-sensitive routes
- [ ] `route-support-map.ts` maps critical routes to runbooks/kill-switches
- [ ] `route-observability-map.ts` maps routes to telemetry expectations
- [ ] `route-auth-capability-map.ts` maps routes to auth/capability requirements
- [ ] `route-deprecation-registry.ts` and `route-dead-page-registry.ts` exist
- [ ] 7 generated proof artifacts in `generated/`
- [ ] 6 validators, 1 BLOCK gate wired into release aggregator
- [ ] TypeScript builds with 0 errors
- [ ] No duplicate route metadata systems

