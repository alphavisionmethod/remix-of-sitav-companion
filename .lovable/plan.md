

# Feature Integration Protocol — Audit & Enforcement Plan

## Current State: Already Extensively Built

The project has a **substantial FIP implementation** already in place:

### What EXISTS (fully built)

| Layer | Status | Details |
|---|---|---|
| **TypeScript governance package** | ✅ Complete | `src/packages/feature-governance/` — 7 files (~1,200 lines): risk tiers (R0–R5), autonomy tiers (7 levels), 16 feature types, kill-switch classes, ownership protocol with 7 rejection rules, 15 capability classes, 10 schema families, 14-section spec template (469 lines), contract evolution rules, sample specs, validation functions |
| **Database tables** | ✅ Complete | 13 tables: `feature_intake_records`, `feature_spec_records`, `feature_owner_decisions`, `feature_compliance_records`, `feature_execution_paths`, `feature_rollout_records`, `feature_deprecation_records`, `feature_readiness_gates`, `feature_generated_truth_impacts`, `capability_registry`, `feature_archetypes`, `feature_blueprints`, `feature_lifecycle_stages` |
| **Data hooks** | ✅ Complete | `use-fip-data.ts` — 218 lines with full CRUD hooks for all 9 core tables |
| **Data service** | ✅ Complete | `feature-lifecycle-data-service.ts` — CRUD for all 9 feature tables |
| **Admin UI pages** | ✅ Complete | All 14 FIP pages exist and are routed: FIP01–FIP14 (Intake Desk, Spec Studio, Owner Boundary, Capability Registry, Compliance Board, Execution Explorer, Policy/Trust Board, Memory/Graph Studio, Observability Center, Rollout Planner, Generated Truth Board, Readiness Gate Review, Deprecation Manager, Builder Console) |
| **Routes** | ✅ Complete | All 14 lazy imports + routes wired in `App.tsx` |

### Is the project FOLLOWING these rules today?

**Partially.** The protocol is encoded and has admin surfaces, but it is not yet **enforced as a mandatory gate**. Currently:

- ✅ Rules are **defined** (risk tiers, ownership rejection rules, capability validation, compliance checks)
- ✅ Surfaces **exist** to inspect compliance
- ❌ No **automated pre-commit or CI check** enforces the protocol before code merges
- ❌ No **runtime gate** blocks feature deployment without protocol compliance
- ❌ The feature registry (`Map<string, FeatureMetadata>`) is **in-memory only** — it resets on refresh
- ❌ Most existing features in the codebase have **not been registered** through the intake → spec → compliance pipeline
- ❌ No **memory rule** exists telling AI agents (including me) to follow this protocol for every new feature

## Plan: Make This a Living Enforced Rule

### 1. Save as permanent project memory rule
Write a memory file at `mem://constraints/feature-integration-protocol` that encodes the core FIP rules as constraints I must follow for every new feature. Add a Core rule to `mem://index.md`.

**Core rule (added to index):**
```
Every new feature must follow FIP: owner boundary → capability registration → spec → compliance check. No bypass.
```

**Memory file contents:** The 10 non-negotiable enforcement rules (no feature without owner, no feature without capability IDs, no boundary-crossing without contracts, etc.) plus the mandatory intake questions and readiness stages.

### 2. Wire the in-memory feature registry to Supabase persistence
The `registerFeature()` / `getAllFeatures()` functions in `src/packages/feature-governance/index.ts` use an in-memory `Map`. Connect them to the existing `feature_intake_records` + `capability_registry` tables so registrations survive refresh.

### 3. Add FIP command palette entries
The 14 FIP pages likely have no command palette entries (similar to the CPS gap fixed earlier). Add them for discoverability.

### 4. Add FIP sub-navigation bar
Create a shared `FIPSubNav.tsx` component (like `CPSSubNav.tsx`) and add it to all 14 FIP pages for seamless navigation.

### 5. Seed existing features into the registry
Create a seed function that registers SITA's existing major features (Money Office, Business OS, Concierge OS, Admin Control Plane, etc.) into the intake/compliance pipeline so the protocol applies retroactively.

### Technical details
- Memory file: ~30 lines of constraint rules
- Registry persistence: ~40 lines connecting `registerFeature` to Supabase
- Command palette: ~20 lines adding 14 entries
- Sub-nav component: ~50 lines (reuse CPSSubNav pattern)
- Feature seed: ~80 lines covering ~15 major existing features
- Total: ~220 lines changed/added across ~18 files

