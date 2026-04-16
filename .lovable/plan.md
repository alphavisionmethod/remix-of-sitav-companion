

# SITA OS — Complete File Classification & Structural Audit Document

## What Exists (Verified)

All 16 canonical registry files: **EXISTS** (0 missing).
All 6 architecture layers (backend-topology, db, surfaces, devices, deployment, runtime): **EXISTS** with barrel exports.
All supabase subdirectories (migrations, schema, policies, seed, docs): **EXISTS**.
All 8 planes (admin, backend, founder, internal-tools, mobile, os, product, shared): **EXISTS** with manifests.

## What Will Be Generated

A single exhaustive document at `/mnt/documents/SITA_FULL_FILE_CLASSIFICATION.md` (~5,000+ lines) containing:

### Section 1: Complete File Classification Matrix
Every file group classified by:
- **Layer**: Web, App, OS, Admin, Kernel, Domain, Shared, Internal
- **Bounded Context**: Business OS, Finance OS, Concierge OS, Investment, Boardroom, Identity, Runtime, Admin, Mobile, etc.
- **Runtime Relevance**: web | desktop | appliance | mobile | shared
- **Reality Classification**: real-executable | architectural-simulation | testing-abstraction | concept-scaffolding | standard-app-code
- **Deployment Relevance**: build-only | runtime | deploy-artifact | docs/validation | support/recovery

Coverage: ~67 lib dirs, 26 page dirs, 29 component dirs, 35 feature dirs, 6 runtime dirs, 9 platform dirs, 34 packages, 74 edge functions, 57 generated artifacts, 234 scripts, 6 electron files, 23 deploy files, 19 infra files, 11 security docs, 9 CI workflows, 161 migrations.

### Section 2: Duplicate Service Family Detection
22 confirmed core-services ↔ services duplicates mapped with canonical target:
- `approval-engine`, `executor-service`, `event-bus`, `policy-engine`, `receipt-service`, `memory-service`, `model-router`, `workflow-engine`, `trust-governor`, `identity-auth`, `brain-core`, `finance-os`, `ai-gateway`, `flagship-loops`, `inference-gateway`, `integration-hub`, `launch-readiness`, `frontend`, `verification-engine`, `handoff`, `conscience-gate`, `google-provider-family`
- Canonical home: `core-services/` (services/ entries become re-export shims)
- 196 remaining services/ entries that have NO core-services counterpart → classify as domain services, projection services, or consolidation candidates

### Section 3: Duplicate Component Family Detection
- `src/components/admin/` vs `src/components/admin-os/` vs `src/components/sita/admin/`
- `src/components/business/` vs `src/components/sita/apps/business/`
- `src/components/finance/` vs `src/components/money/` vs `src/components/sita/apps/finance/`
- `src/components/investment/` vs `src/components/sita/apps/investment/`
- `src/components/concierge/` vs `src/components/sita/apps/concierge/`
- Cards/badges/primitives overlap detection across `src/components/cards/`, `src/components/sita/cards/`, `src/components/sita/badges/`, `src/components/sita/primitives/`

### Section 4: Admin Route Sprawl Analysis
503 admin pages across 16 subdirectories → propose canonical 7-domain structure:
1. Architecture & Governance (architecture, platform-law, fip)
2. Intelligence & AI (intelligence, sag)
3. Launch & Verification (launch, verification, implementation-truth)
4. Security & Audit (security, reality-audit)
5. Strategic & Modules (strategic, modules)
6. Cloud & Infrastructure (cloud)
7. Customer Journey & Frontend (customer-journey, frontend)

### Section 5: Edge Function Topology Classification
All 74 functions classified into:
- **User BFF** (5): user-bff-gateway, main, get-weather, vapid-public-key, personal-brain
- **Admin BFF** (5): admin-bff-gateway, admin-api, admin-gateway, admin-users, admin-intelligence
- **Domain Functions** (20): business-*, cashflow-*, invoice-*, tax-*, revenue-*, crm-*, booking-*
- **AI/Agent Functions** (15): ai-gateway, advisor-*, agent-*, brain-core, chat-advisor, check-ai-budget, intelligence-api, business-advisor-intelligence
- **Connector Functions** (8): connector-batch, connector-discover, connector-health, connector-oauth, connector-operations, connector-proxy, connector-transform, provider-family-operations
- **System/Runtime** (10): os-agent-channel, os-command, os-status, runtime-probes, self-healing, system-updates, event-processor, scheduler-dispatch
- **Cloud Infrastructure** (7): cloud-admin-api, cloud-device-api, cloud-lifecycle-api, cloud-storage-api, cloud-sync-api, cloud-tenant-api, cloud-worker-api
- **Compliance/Support** (4): gdpr-delete, gdpr-export, support-gateway, verification-recorder

### Section 6: DB Visibility Verification
- 198 tables with 323 RLS policies → all mapped in `src/lib/db/schema-registry.ts`
- 161 migrations in `supabase/migrations/` → tracked in `src/lib/db/migration-registry.ts`
- `supabase/schema/`, `supabase/policies/`, `supabase/seed/`, `supabase/docs/` all present with READMEs

### Section 7: Missing Runtime Truth Files
All verified present:
- `runtime-message-registry.ts`, `service-lifecycle-registry.ts`, `runtime-capability-matrix.ts`, `product-reality-tiers.ts`, `feature-tier-registry.ts`, `simulated-surface-registry.ts`, `runtime-flags.ts`, `runtime-assertions.ts`, `reality-classification-registry.ts`, `infra-runtime-classification-map.ts`, `infra-implementation-coverage-map.ts`

### Section 8: Mobile Platform Contract Status
- 25 mobile pages in `src/pages/mobile/`
- `src/components/mobile/` present
- `src/features/mobile/` present
- `src/runtimes/mobile/index.ts` present
- `src/planes/MOBILE_MANIFEST.md` present
- `infra/deploy/mobile.yaml` (Flutter deployment manifest) present
- **Gap**: No actual Flutter/native code — mobile is PWA/responsive web only. Native bridges are `SIMULATED_ONLY`.

### Section 9: Kill-Switch / Runbook / Journey Registry
All present and verified:
- `src/lib/control-plane/kill-switch-registry.ts` — 10 subsystem kill switches
- `src/lib/support/runbook-registry.ts` — 10 runbook definitions
- `src/lib/journeys/golden-path-registry.ts` — 11 golden path journeys

### Section 10: Consolidation Recommendations
Specific merge/deprecate/wrap actions for:
- 22 duplicate service families
- 6 duplicate component families
- `owner` vs `owner-mode` page merge
- `mission` vs `mission-control` page merge
- Admin 503→~120 page consolidation roadmap

## Technical Approach
Generate via Python script to `/mnt/documents/SITA_FULL_FILE_CLASSIFICATION.md`. All data sourced from verified filesystem scans. Every finding references actual file paths.

## File Count
Single document, ~5,000 lines, covering every file group in the repository.

