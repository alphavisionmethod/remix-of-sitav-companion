
# SITA Delivery Operating System — Implementation Plan

## Phase A: Database Schema (Migration)
Create the core persistence tables for the delivery methodology:
- `feature_blueprints` — canonical blueprint for every feature (domain, type, persistence class, trust needs, launch criticality)
- `feature_lifecycle_stages` — tracks each feature through the 13-stage lifecycle pipeline
- `domain_methodology_packs` — per-domain methodology definitions (routes, shells, contracts, events, proofs)
- `feature_archetypes` — canonical feature type definitions (boardroom, office, simulator, workflow, etc.)
- `delivery_templates` — per-archetype generation templates (expected files, components, contracts)
- `dependency_maps` — auto-mapped dependencies per feature (contracts, services, policies, probes)
- `change_impact_records` — impact analysis for proposed changes
- `delivery_waves` — batched delivery planning
- `platform_maturity_scores` — domain/feature maturity tracking
- `remediation_suggestions` — auto-generated fix suggestions

## Phase B: Core Engine Logic (src/lib/delivery-methodology/)
- `feature-lifecycle.ts` — lifecycle state machine (proposed→specified→generated→…→evolving→deprecated)
- `feature-factory.ts` — auto-generates feature ID, classification, route plan, contract stubs, manifests
- `blueprint-engine.ts` — validates and enriches blueprints
- `dependency-mapper.ts` — auto-maps contracts, services, policies, probes needed
- `change-impact-analyzer.ts` — determines affected routes/contracts/journeys
- `delivery-readiness.ts` — orchestrates readiness checks across all gates
- `archetype-registry.ts` — canonical feature types with default requirements
- `domain-packs.ts` — methodology packs per domain (Money, Revenue, AI Engineering, etc.)
- `maturity-model.ts` — tracks maturity by domain/feature/truth level
- `remediation-engine.ts` — proposes exact fixes for gaps

## Phase C: Admin Surfaces (10 pages)
1. **Feature Intake Desk** (`/admin/feature-intake`) — structured intake for new features
2. **Blueprint Studio** (`/admin/blueprint-studio`) — create/review/approve blueprints
3. **Feature Lifecycle Board** (`/admin/feature-lifecycle`) — track all features through pipeline stages
4. **Feature Factory Console** (`/admin/feature-factory`) — generate artifacts from blueprints
5. **Domain Methodology Packs** (`/admin/domain-packs`) — view/edit per-domain methodology
6. **Dependency Map Viewer** (`/admin/dependency-map`) — visualize feature dependencies
7. **Change Impact Analyzer** (`/admin/change-impact`) — analyze proposed changes
8. **Delivery Readiness Board** (`/admin/delivery-readiness`) — orchestrate launch readiness
9. **Platform Maturity Dashboard** (`/admin/platform-maturity`) — maturity scores by domain
10. **AI Builder Knowledge Base** (`/admin/builder-knowledge`) — patterns, examples, domain packs

## Phase D: Route Registration
Wire all 10 new routes into App.tsx with lazy loading.
