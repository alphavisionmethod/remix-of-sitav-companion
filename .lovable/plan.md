

# MSA Wave — Gap Analysis and Enhancement Plan

## What's Already Implemented (8/15 requirements met)

| Delivered | Status |
|---|---|
| 8 DB tables (surface_types, surface_adapters, capability_definitions, capability_surface_bindings, shell_implementations, surface_readiness_records, architecture_boundary_records, cross_surface_consistency_records) | Done |
| Edge function `msa-operations` with 4 actions (seed_surfaces, seed_capabilities, audit_boundaries, check_consistency) | Done |
| 5 admin pages (MSA01-MSA05) with routes at `/admin/msa/*` | Done |
| 5 surfaces seeded (Web, iOS, Android, Desktop, Spatial) | Done |
| 18 capabilities across 8 domains | Done |
| Boundary audit with violation detection | Done |
| Cross-surface consistency checks | Done |
| Existing contract at `os-unification-runtime.ts` with SurfaceType | Done |

## What's Missing or Needs Enhancement

### GAP 1 — Experience Grammar Layer (Part 3.6 — completely missing)
The prompt requires a formalized Experience Grammar Layer covering trust-state language, workflow-state language, action-state language, receipt/proof language, command language, boardroom language, notification urgency, opportunity scoring, degraded state semantics, and refusal semantics. No contract or code exists for this.

**Plan**: Create `src/packages/contracts/msa/experience-grammar.ts` defining canonical grammar types for all 10 semantic categories. Add DB table `experience_grammar_records` for runtime governance.

### GAP 2 — Missing DB tables from Part 7 data model
The prompt specifies 15 canonical record types. Currently only 8 tables exist. Missing:
- `surface_constraint_records` (surfaceConstraintRecord)
- `capability_portability_records` (capabilityPortabilityRecord) 
- `surface_launch_profiles` (surfaceLaunchProfileRecord)
- `surface_trust_presentation_records` (surfaceTrustPresentationRecord)
- `surface_receipt_presentation_records` (surfaceReceiptPresentationRecord)
- `surface_performance_profiles` (surfacePerformanceProfileRecord)
- `surface_notification_grammar_records` (surfaceNotificationGrammarRecord)
- `surface_interaction_grammar_records` (surfaceInteractionGrammarRecord)
- `surface_navigation_grammar_records` (surfaceNavigationGrammarRecord)

Note: Some of these are partially embedded as JSONB columns in `surface_adapters` (navigation_grammar, interaction_grammar, notification_grammar, performance_profile). The prompt demands them as first-class records.

**Plan**: Create a migration adding the 6 most critical missing tables: `experience_grammar_records`, `surface_constraint_records`, `capability_portability_records`, `surface_launch_profiles`, `surface_trust_presentations`, `surface_notification_grammars`. Keep the existing JSONB columns as quick-access caches; the new tables become the canonical source.

### GAP 3 — No actual capability service layer (Part 3.3 + Part 5 Rules + Part 9 Workstream B)
The prompt demands that business logic be extracted from pages into a capability layer at paths like `src/lib/capabilities/`. The boundary audit _references_ targets like `src/lib/capabilities/advisor-capability.ts` and `src/lib/domain/money-service.ts`, but these files do not exist. The prompt's Rules 1-4 (pages must not own business logic, hooks must not be hidden engines, every side-effect must be capability-driven) are declared but not enforced through code.

**Plan**: Create `src/lib/capabilities/` with a `capability-registry.ts` (typed capability invocation interface), plus 4 reference capability modules: `files-capability.ts`, `advisor-capability.ts`, `connector-capability.ts`, `money-capability.ts`. Each wraps the existing data-service calls behind a surface-neutral capability interface. This makes the audit targets real, not aspirational.

### GAP 4 — MSA contract package missing (Part 3.2 + 3.4)
Surface-neutral contracts for the MSA model don't exist in `src/packages/contracts/`. The existing `os-unification-runtime.ts` is minimal (29 lines, no adapter/grammar/capability contracts).

**Plan**: Create `src/packages/contracts/msa/` with:
- `surface-types.ts` — canonical SurfaceType, SurfaceClass, ReadinessStage enums
- `capability-contract.ts` — CapabilityDefinition, CapabilityBinding, PortabilityClass
- `adapter-contract.ts` — SurfaceAdapter, NavigationGrammar, InteractionGrammar, NotificationGrammar
- `experience-grammar.ts` — all 10 grammar categories
- `shell-contract.ts` — ShellImplementation, ShellType
- `index.ts` barrel

### GAP 5 — Edge function needs more actions
`msa-operations` has 4 actions. Missing: `seed_experience_grammars`, `portability_report`, `surface_launch_profile_check`.

**Plan**: Add 3 actions to the edge function to seed experience grammars, generate a portability report (per-capability per-surface readiness matrix), and evaluate surface launch profiles.

### GAP 6 — MSA01 missing prompt-specified components
The prompt specifies MSA01 must have: `SurfaceReadinessHero`, `PortabilityCoverageCards`, `CapabilityPortabilityMatrix`, `BlockerRail`. Current MSA01 has generic cards but not these named sections.

**Plan**: Refactor MSA01 to include clearly labeled sections matching the prompt's component names. Add a `BlockerRail` section showing all readiness blockers across surfaces. Add a `CapabilityPortabilityMatrix` summary mini-table.

### GAP 7 — MSA05 missing CompatibilityHeatmap
Prompt requires `CompatibilityHeatmap`, `WebTrappedLogicList`, `MigrationRecommendations`. Current MSA05 has a flat list and table but no heatmap visualization or migration recommendations section.

**Plan**: Add a domain-grouped heatmap grid (color-coded cells per domain per surface), a dedicated `WebTrappedLogicList` section, and a `MigrationRecommendations` panel with prioritized next steps.

### GAP 8 — Voice surface not in registry
Prompt lists "future voice/ambient/device surfaces." The current seed only covers web, iOS, Android, desktop, spatial. No voice surface.

**Plan**: Add `voice` surface type to the seed data with interaction_model `voice_command`, notification_model `audio_spoken`, readiness_stage `planned`.

## Implementation Sequence

1. **Database migration** — Add 6 new tables + voice surface seed
2. **MSA contract package** — `src/packages/contracts/msa/` with 6 files
3. **Capability service layer** — `src/lib/capabilities/` with registry + 4 modules
4. **Edge function enhancement** — 3 new actions + voice surface + experience grammar seeding
5. **MSA01 enhancement** — SurfaceReadinessHero, PortabilityCoverageCards, CapabilityPortabilityMatrix, BlockerRail
6. **MSA05 enhancement** — CompatibilityHeatmap, WebTrappedLogicList, MigrationRecommendations
7. **Build verification** — zero TS errors

## Technical Details

### New tables schema (simplified)

```text
experience_grammar_records: id, user_id, grammar_type (trust_state|workflow_state|action_state|receipt_proof|command|boardroom|notification_urgency|opportunity_scoring|degraded_state|refusal), grammar_key, display_name, canonical_values jsonb, surface_rendering_rules jsonb

surface_constraint_records: id, user_id, surface_id FK, constraint_type, constraint_key, constraint_value jsonb, enforced boolean

capability_portability_records: id, user_id, capability_id FK, surface_id FK, portability_score int, blockers text[], evidence jsonb

surface_launch_profiles: id, user_id, surface_id FK, launch_target_date, readiness_score int, gate_results jsonb, blockers text[]

surface_trust_presentations: id, user_id, surface_id FK, trust_element, rendering_strategy, component_pattern, verified boolean

surface_notification_grammars: id, user_id, surface_id FK, urgency_level, channel, delivery_method, template jsonb
```

### Capability registry interface

```typescript
interface CapabilityInvocation {
  capabilityKey: string;
  params: Record<string, unknown>;
  surface: string;
  userId: string;
  mode: "live" | "demo" | "simulation";
}

interface CapabilityResult {
  success: boolean;
  data?: unknown;
  receipt?: { id: string; hash: string };
  error?: string;
}

function invokeCapability(inv: CapabilityInvocation): Promise<CapabilityResult>;
```

This plan closes all 8 gaps, advancing MSA from "framework seeded" to "architecturally complete with real capability layer, full data model, and prompt-faithful admin surfaces."

