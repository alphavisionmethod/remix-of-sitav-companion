# SITA OS — Layer Separation Architecture

## The 6-Layer Model

SITA OS is divided into exactly 6 architectural layers. Every route, service, component, and contract belongs to one canonical layer.

| # | Layer | Purpose | Layout Shell |
|---|-------|---------|-------------|
| 1 | **Web** | Public web shell — landing, auth, marketing | `PublicLayout` |
| 2 | **App** | Authenticated user experience — dashboards, domain surfaces | `ShellLayout` |
| 3 | **OS Services** | Cross-domain orchestration — attention, continuity, timing | *(consumed by App)* |
| 4 | **OS Kernel** | Execution primitives — brain, policy, receipts, capabilities | *(consumed by OS Services)* |
| 5 | **Admin/Operator** | Governance, truth, verification, launch readiness | `AdminShell` / `OwnerWorkspaceShell` |
| 6 | **Domain Capability** | Bounded domain actions — business, finance, concierge | *(consumed by App + OS)* |

## Route Prefix → Layer

| Prefix | Layer | Domain |
|--------|-------|--------|
| `/login`, `/signup`, `/forgot-password`, `/reset-password` | Web | — |
| `/landing` | Web | — |
| `/business/*` | App | business-os |
| `/money/*` | App | finance-os |
| `/concierge/*` | App | concierge-os |
| `/boardroom/*` | App | cross-domain |
| `/revenue-office/*` | App | business-os |
| `/investment-office/*` | App | finance-os |
| `/digital-presence/*` | App | business-os |
| `/files/*` | App | — |
| `/settings/*` | App | — |
| `/notifications/*` | App | — |
| `/admin/*` | Admin/Operator | — |
| `/owner/*` | Admin/Operator | — |
| `/mission/*` | Admin/Operator | — |

## Import Rules

```
Web → (nothing)
App → OS Services, Domain Capability
OS Services → OS Kernel, Domain Capability
OS Kernel → (nothing above)
Admin/Operator → OS Services, OS Kernel, Domain Capability, App
Domain Capability → OS Kernel
```

### Hard Violations (never allowed)
- Web importing OS Kernel or Admin
- App importing OS Kernel directly
- Kernel importing App or Admin
- Domain capabilities importing App or Admin
- Services importing page components
- Contracts importing runtime services

## Service Directory → Layer

### OS Kernel (`src/lib/core-services/`)
brain-core, conscience-gate, canonical-pipeline, capability-router, executor-service, receipt-service, event-bus, approval-engine, trust-state-service, constitution-compiler, policy-engine, model-router

### OS Services (`src/lib/services/`)
intent-orchestrator, attention-os, continuity-engine, chief-of-staff, timing-intelligence, digest-engine, sita-modes, adaptive-interface, opportunity-engine, memory-governance, boundary-engine, experience-signature, personal-graph, trust-actions, relationship-intelligence, ai-gateway

### Domain Capability (`src/lib/services/`)
business-os, finance-os, concierge-os

## Verification Checklist

- [ ] Are public web routes free of OS execution logic?
- [ ] Are app routes initiating actions rather than directly executing privileged behavior?
- [ ] Does every `/admin/*` route render inside AdminShell?
- [ ] Are contracts pure and free of runtime imports?
- [ ] Are domain services isolated (no cross-domain imports)?
- [ ] Do services never import from `src/pages/` or `src/components/`?
- [ ] Can a new engineer tell what belongs to App vs OS vs Web in under an hour?
- [ ] Are all admin/operator surfaces clearly separated from user app?
- [ ] Is the service count within the ~45 canonical budget?
- [ ] Are duplicate services tracked with canonical pointers?

## CI Enforcement

Run: `npx tsx scripts/architecture/check-layer-boundaries.ts`

This checks all import rules above and exits non-zero on violations.

## Files

| File | Purpose |
|------|---------|
| `src/lib/architecture/layer-manifest.ts` | Layer definitions, route→layer map, service→layer map |
| `src/lib/architecture/boundary-rules.ts` | Import direction rules, forbidden patterns |
| `src/lib/architecture/route-registry.ts` | Route→layer/domain/risk tagged registry |
| `src/lib/architecture/service-ownership-manifest.ts` | Service ownership, duplicates, budget |
| `scripts/architecture/check-layer-boundaries.ts` | CI boundary violation scanner |
