# SITA OS — Layer Separation Architecture & Developer/Operator Bible Part 2

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

---

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
| `/connectors/*` | App | — |
| `/advisors/*` | App | — |
| `/policies/*` | App | — |
| `/governance/*` | App | — |
| `/enterprise/*` | App | — |
| `/workspace/*` | App | — |
| `/observability/*` | App | — |
| `/search/*` | App | — |
| `/onboarding/*` | App | — |
| `/app-store/*` | App | — |
| `/admin/*` | Admin/Operator | — |
| `/owner/*` | Admin/Operator | — |
| `/mission/*` | Admin/Operator | — |
| `/nova-desktop/*` | OS Kernel | — |

---

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
- App importing OS Kernel directly (must go through OS Services proxy)
- Kernel importing App or Admin
- Domain capabilities importing App or Admin
- Services importing page components
- Contracts importing runtime services
- Hooks importing OS Kernel directly
- Owner/Mission pages importing user app pages
- Services using relative imports to UI code

---

## CI Enforcement — 9 Rules

Run: `npx tsx scripts/architecture/check-layer-boundaries.ts`

| Rule | ID | Scans | Flags |
|------|----|-------|-------|
| 1 | `WEB_IMPORTS_KERNEL` | `src/pages/auth/` | Auth pages importing kernel/admin |
| 2 | `ADMIN_IMPORTS_APP_PAGE` | `src/pages/admin/` | Admin importing user app pages |
| 3 | `SERVICE_IMPORTS_UI` | `src/lib/services/`, `src/lib/core-services/` | Services importing pages/components |
| 4 | `CONTRACT_IMPORTS_RUNTIME` | `src/packages/contracts/` | Contracts importing runtime |
| 5 | `CROSS_DOMAIN_IMPORT` | Domain service dirs | Cross-domain imports |
| 6 | `APP_IMPORTS_KERNEL` | `src/pages/` (non-admin) | App pages importing core-services |
| 7 | `HOOK_IMPORTS_KERNEL` | `src/hooks/` | Hooks importing core-services |
| 8 | `OPERATOR_IMPORTS_APP_PAGE` | `src/pages/owner/`, `src/pages/mission/` | Operator importing user pages |
| 9 | `SERVICE_RELATIVE_UI_IMPORT` | Service dirs | Relative imports to UI |

---

## Service Directory → Layer

### OS Kernel (`src/lib/core-services/`)
brain-core, conscience-gate, canonical-pipeline, capability-router, executor-service, receipt-service, event-bus, approval-engine, trust-state-service, constitution-compiler, policy-engine, model-router, inference-gateway, epistemic-firewall, mnemosyne, memory-service, trust-governor, verification-engine, workflow-engine, identity-auth, integration-hub, launch-readiness, service-registry

### OS Services (`src/lib/services/`)
intent-orchestrator, attention-os, continuity-engine, chief-of-staff, timing-intelligence, digest-engine, sita-modes, adaptive-interface, opportunity-engine, memory-governance, boundary-engine, experience-signature, personal-graph, trust-actions, relationship-intelligence, ai-gateway, recommendation-execution, handoff, projection-service, flagship-loops, search-fabric, fraud-sentinel, governance-simulator

### Domain Capability (`src/lib/services/`)
business-os, finance-os, concierge-os

### Admin/Operator
admin-service, self-healing, connector-health-service, incident-management, support-diagnostics, analytics-service

### App
auth, notification-service, google-provider-family, life-simulation

---

## Canonical Ownership Matrix

| System | Intended Layer | Canonical Owner | Boundary Health |
|--------|---------------|-----------------|-----------------|
| Brain Core | OS Kernel | `core-services/brain-core` | ✅ Enforced |
| Model Router | OS Kernel | `core-services/model-router` | ✅ Enforced |
| Conscience Gate | OS Kernel | `core-services/conscience-gate` | ✅ Enforced |
| Policy Engine | OS Kernel | `core-services/policy-engine` | ✅ Enforced |
| Executor Service | OS Kernel | `core-services/executor-service` | ✅ Enforced |
| Receipt Service | OS Kernel | `core-services/receipt-service` | ✅ Enforced |
| Capability Router | OS Kernel | `core-services/capability-router` | ✅ Enforced |
| Approval Engine | OS Kernel | `core-services/approval-engine` | ✅ Enforced |
| Mnemosyne | OS Kernel | `core-services/mnemosyne` | ✅ Enforced |
| Event Bus | OS Kernel | `core-services/event-bus` | ✅ Enforced |
| Inference Gateway | OS Kernel | `core-services/inference-gateway` | ✅ Enforced |
| Intent Orchestrator | OS Services | `services/intent-orchestrator` | ✅ Enforced |
| Attention OS | OS Services | `services/attention-os` | ✅ Enforced |
| Continuity Engine | OS Services | `services/continuity-engine` | ✅ Enforced |
| Chief of Staff | OS Services | `services/chief-of-staff` | ✅ Enforced |
| AI Gateway | OS Services | `services/ai-gateway` | ✅ Enforced |
| Business OS | Domain Capability | `services/business-os` | ✅ Enforced |
| Finance OS | Domain Capability | `services/finance-os` | ✅ Enforced |
| Concierge OS | Domain Capability | `services/concierge-os` | ✅ Enforced |
| Admin Service | Admin/Operator | `services/admin-service` | ✅ Enforced |

---

## Separation Maturity Matrix

| Layer | Boundary Explicit | Imports Enforced | Routing Correct | Ownership Declared | CI Checked |
|-------|:-:|:-:|:-:|:-:|:-:|
| Web | ✅ | ✅ | ✅ | ✅ | ✅ |
| App | ✅ | ✅ | ✅ | ✅ | ✅ |
| OS Services | ✅ | ✅ | ✅ | ✅ | ✅ |
| OS Kernel | ✅ | ✅ | ✅ | ✅ | ✅ |
| Admin/Operator | ✅ | ✅ | ✅ | ✅ | ✅ |
| Domain Capability | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## Implementation Discipline — Capability Verdicts

| Capability | Verdict | Rationale |
|-----------|---------|-----------|
| Adaptive Router | `partial_only` | Bounded, explainable routing only. No black-box model selection. |
| Consensus / Multi-Model Verification | `partial_only` | Only for high-stakes flows (financial, irreversible). Not default. |
| Long-Term Memory | `build_later` | Requires structured memory governance, privacy tiers, provenance. Not ready. |
| Automated Ingestion | `partial_only` | Approved bounded sources only. No broad crawling. |
| Capability/Tool Routing | `build_now` | Reduces kernel bypass risk. Essential for correct execution chain. |
| Journey Engine | `partial_only` | Selected workflows only. No speculative multi-journey orchestration. |
| Reasoning Trace Viewer | `build_later` | Improves trust but requires stable execution chain first. |
| Local Model Fallback | `defer_strictly` | No real offline/privacy need proven yet. Premature complexity. |
| Full LoRA / Hyper-personalization | `defer_strictly` | Architecture trap. No product justification at current stage. |
| Model Distillation | `defer_strictly` | Requires mature model routing and cost governance first. |
| Multi-modal Fusion | `defer_strictly` | Text-first is correct. Image/audio/video fusion is speculative sprawl. |
| On-Device Models | `avoid_for_now` | No device strategy. No offline mandate. Pure complexity. |
| Autonomous Self-Healing AI | `avoid_for_now` | Violates trust model. Self-learning must never mutate permissions. |
| Full Autopilot | `avoid_for_now` | Category violation. SITA is sovereign-control, not autonomous-agent. |

---

## Structural Verification Checklist

- [ ] Are public web routes free of OS execution logic?
- [ ] Are app routes initiating actions rather than directly executing privileged behavior?
- [ ] Does every `/admin/*` route render inside AdminShell?
- [ ] Does every `/owner/*` route render inside OwnerWorkspaceShell?
- [ ] Does every `/mission/*` route render inside AdminShell?
- [ ] Are contracts pure and free of runtime imports?
- [ ] Are domain services isolated (no cross-domain imports)?
- [ ] Do services never import from `src/pages/` or `src/components/`?
- [ ] Do hooks never import directly from `src/lib/core-services/`?
- [ ] Do app pages never import directly from `src/lib/core-services/`?
- [ ] Do owner/mission pages never import user app page components?
- [ ] Can a new engineer tell what belongs to App vs OS vs Web in under an hour?
- [ ] Are all admin/operator surfaces clearly separated from user app?
- [ ] Is the service count within the ~45 canonical budget?
- [ ] Are duplicate services tracked with canonical pointers?
- [ ] Does every execution path produce a receipt?
- [ ] Are policy checks enforced before execution?
- [ ] Is the capability router the sole entry point for domain actions?
- [ ] Do no services use relative imports to reach UI code?
- [ ] Are edge functions free of frontend page imports?
- [ ] Are all 6 layers represented in the layer manifest?
- [ ] Do route families match their declared layer in the registry?
- [ ] Is the boundary check script running all 9 rules?
- [ ] Are proxy re-exports used where app needs kernel types?
- [ ] Is the Architecture Boundary Board accessible to operators?

---

## Files

| File | Purpose |
|------|---------|
| `src/lib/architecture/layer-manifest.ts` | Layer definitions, route→layer map, service→layer map |
| `src/lib/architecture/boundary-rules.ts` | Import direction rules, forbidden patterns |
| `src/lib/architecture/route-registry.ts` | Route→layer/domain/risk tagged registry |
| `src/lib/architecture/service-ownership-manifest.ts` | Service ownership, duplicates, budget |
| `scripts/architecture/check-layer-boundaries.ts` | CI boundary violation scanner (9 rules) |
| `scripts/check-import-boundaries.ts` | Domain isolation + contract boundary checker |
| `src/pages/admin/architecture/ArchitectureBoundaryBoard.tsx` | Visual boundary dashboard for operators |
| `docs/architecture/LAYER_SEPARATION.md` | This file — structural truth source |
