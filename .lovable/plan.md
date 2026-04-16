

## Audit Plan: 100% Reality, Deployability & Production Truth

I need to inspect the current state of the platform against the 13-section checklist before proposing any new work. The previous 8 phases built the meta-architecture spine (bounded contexts, runtime tiers, permission matrix, kill switches, runbooks, golden paths, meta-arch admin, CI umbrella). This audit proves whether *runtime reality* matches that spine.

### Phase A — Reality Audit (read-only, in this plan)

I will inspect:

1. **Surface contracts** — verify every claimed surface (web/iOS/Android/Electron/VMware/Admin) has a runtime contract file in `src/lib/runtime/` and a deployment manifest in `infra/deploy/`.
2. **Bounded context coverage** — cross-check `bounded-context-registry` against routes, services, edge functions, and DB tables. Find orphans.
3. **Frontend reality gates** — scan pages for: mock providers in prod, missing empty/error/degraded states, unwired CTAs, dead nav links, demo-only imports.
4. **Mobile deployability** — verify Capacitor or PWA config, push transport wiring, deep-link resolver, offline sync engine.
5. **VMware/ISO path** — verify ISO build script, OVA export, cloud-init, OTA agent, backup/restore scripts are real.
6. **AI governance** — verify `invokeAICapability` is the only path; scan for direct provider SDK imports.
7. **Integrations** — verify connector tokens table, OAuth flows, webhook receivers exist for every claimed integration.
8. **Auth/permissions/proof/recovery** — verify granular permission gates on admin routes, RLS coverage, kill-switch enforcement points, runbook drill scripts.
9. **Support/operations** — verify runbook coverage, on-call rotation manifest, incident command surface.

### Phase B — Implementation Plan (executed after approval)

Based on audit findings, deliver in 4 sub-phases. Each ends with a CI gate and a manifest artifact.

**B1 — Reality Contracts & Surface Honesty (~800 LOC)**
- Extend `src/lib/runtime/` with missing contracts: `mobile-runtime-contract.ts`, `appliance-runtime-contract.ts`, `admin-runtime-contract.ts`.
- Create `src/lib/reality/feature-reality-registry.ts` — typed registry classifying every feature as `real | simulated | degraded | unsupported | roadmap`.
- Create `src/lib/reality/surface-claim-map.ts` mapping each surface to honest capability claims.
- CI gate: `check-feature-reality-coverage.ts` — fail if any feature in the route registry lacks a reality classification.
- Doc: `docs/architecture/PRODUCT_REALITY_BASELINE.md`.

**B2 — Bounded Context Completeness (~600 LOC)**
- Extend `bounded-context-registry.ts` to enforce every context declares: owner, APIs, read models, write models, external deps, deployment unit, test suite path.
- Create `src/lib/architecture/context-membership-map.ts` — maps every route, service, edge function, and table to exactly one context.
- CI gate: `check-context-membership.ts` — fail on orphans (route/service/function/table without context) or duplicates (assigned to >1).
- Generated artifact: `generated/context-membership-manifest.json`.

**B3 — Frontend Reality Gates (~900 LOC)**
- Create `src/lib/reality/page-state-contract.ts` — typed contract requiring loading/empty/error/degraded states per page class.
- Create `src/lib/reality/page-state-registry.ts` — registry of state coverage per route.
- Build CI gate `check-page-state-coverage.ts` that scans `src/pages/**` for required state markers.
- Build CI gate `check-cta-wiring.ts` — scans for `onClick={() => {}}`, `disabled` without reason, `TODO`, placeholder hrefs.
- Build CI gate `check-mock-leak.ts` — fails if `useDemoData` / mock providers are imported by any production route in real mode.
- Generated artifact: `generated/frontend-reality-report.json`.

**B4 — Deployability & Operability Truth (~700 LOC)**
- Verify and harden:
  - `infra/deploy/mobile.yaml` push transport secrets are wired into `mobile-push-service.ts`.
  - `scripts/release/iso/` end-to-end (build → autoinstall → OTA → backup → restore).
  - `scripts/release/vmware/build-ova.sh` produces validated OVA.
- Create `src/lib/deploy/deployability-registry.ts` — per-surface deployability score (build, sign, distribute, update, recover).
- CI gate: `check-deployability-coverage.ts` — fails if any claimed surface scores < 100%.
- Wire into Phase 8 CI Umbrella as a new gate group `deployability`.

### Phase C — Final Wiring

- Add 4 new gates to `ci-gate-registry.ts` (Phase 8 umbrella).
- Add `META04ProductReality.tsx` admin page surfacing the live reality + deployability matrix at `/admin/meta/reality`.
- Update `docs/architecture/META_ARCH_REGISTRY.md` to reference the reality plane.
- Run full umbrella locally; require 0 errors before declaring deployment-ready.

### Deliverables Summary

| Sub-phase | Files | LOC | New CI gates |
|-----------|-------|-----|--------------|
| B1 Reality contracts | 6 lib + 1 doc | ~800 | 1 |
| B2 Context completeness | 2 lib + 1 script + 1 manifest | ~600 | 1 |
| B3 Frontend gates | 2 lib + 3 scripts + 1 report | ~900 | 3 |
| B4 Deployability | 1 lib + 1 script + script audits | ~700 | 1 |
| C Final wiring | 1 admin page + registry updates | ~400 | — |
| **Total** | **~17 files** | **~3400 LOC** | **6 gates** |

### Acceptance Criteria

- All 6 new CI gates pass with 0 errors.
- Every surface, feature, route, service, function, and table is classified.
- No production route imports demo/mock providers.
- Every claimed deployment target has a verified build → sign → distribute → update → recover path.
- Admin can see reality status live at `/admin/meta/reality`.

