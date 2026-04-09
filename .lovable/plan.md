

# Fix Section 11 (Orphaned Tables) & Section 17 (Missing Headings)

## Section 11: 24 Orphaned Tables — ALREADY FIXED

All 24 tables listed as "orphaned" are already wired to data services:

| Table | Wired In |
|-------|----------|
| action_escalations | cai-data-service.ts (`escalations`) |
| adaptive_interface_profiles | cai-data-service.ts (`interfaceProfiles`) |
| ai_agent_tasks | persistence-adapters.ts (full CRUD) |
| boundary_policies | cai-data-service.ts (`boundaryPolicies`) |
| cai_continuity_sessions | cai-data-service.ts (`continuitySessions`) |
| command_orchestrations | cai-data-service.ts (`commands`) |
| coordinated_assistant_sessions | cai-data-service.ts (`assistantSessions`) |
| digest_compilations | cai-data-service.ts (`digests`) |
| experience_signature_rules | cai-data-service.ts (`experienceRules`) |
| financial_documents | money-data-service.ts (4 functions) |
| handoff_contexts | cai-data-service.ts (`handoffs`) |
| human_obligations | cai-data-service.ts (`obligations`) |
| intelligence_assets_library | intelligence-asset-persistence.ts |
| intent_resolutions | cai-data-service.ts (`intents`) |
| memory_corrections | cai-data-service.ts (`memoryCorrections`) |
| memory_governance_records | cai-data-service.ts (`memoryGovernance`) |
| operating_modes | cai-data-service.ts (`operatingModes`) |
| opportunity_signals | cai-data-service.ts (`opportunitySignals`) |
| personal_operating_graph_edges | cai-data-service.ts (`graphEdges`) |
| personal_operating_graph_nodes | cai-data-service.ts (`graphNodes`) |
| priority_stacks | cai-data-service.ts (`priorities`) |
| relationship_contexts | cai-data-service.ts (`relationships`) |
| scenarios | platform-ops-data-service.ts (`platformScenarios`) |
| timing_intelligence_decisions | cai-data-service.ts (`timingDecisions`) |

**No code changes needed for Section 11.**

---

## Section 17: Pages Without Headings — 18 Pages Need Fixes

After filtering out pages that already get `<h1>` from `MobileShell`, `DomainHeader`, or are sub-components (onboarding screens), **18 pages** truly lack an accessible `<h1>`:

### Category A: Tab-wrapper pages (4 files)
These are shell pages that render child components via tabs. Each child already has its own `SitaPageHeader`. Add a **visually-hidden** `<h1>` for screen readers:

- `src/pages/BusinessCenter.tsx` → `<h1 className="sr-only">Business Center</h1>`
- `src/pages/ConciergeCenter.tsx` → `<h1 className="sr-only">Concierge Center</h1>`
- `src/pages/FilesCenter.tsx` → `<h1 className="sr-only">Files Center</h1>`
- `src/pages/MoneyCenter.tsx` → `<h1 className="sr-only">Money Center</h1>`

### Category B: Admin connector pages (7 files)
Add `SitaPageHeader` import from `SitaCard` and insert a header at the top of the return block:

- `CN01ConnectorRealityOverview.tsx` — "Connector Reality Overview"
- `CN02ConnectorRegistryConsole.tsx` — "Connector Registry Console"
- `CN03AccountLinkageBoard.tsx` — "Account Linkage Board"
- `CN04SyncTruthCenter.tsx` — "Sync Truth Center"
- `CN05ConnectorHealthBoard.tsx` — "Connector Health Board"
- `CN06ConnectorDemoReview.tsx` — "Connector Demo Review"
- `CN07ConnectorLaunchGate.tsx` — "Connector Launch Gate"

### Category C: App platform & store pages (3 files)
- `AppStorePage.tsx` — Add `<h1>` "App Store"
- `FirstLaunchPage.tsx` — Add `<h1>` "First Launch"
- `PackStorePage.tsx` — Add `<h1>` "Pack Store"

### Category D: Standalone pages (4 files)
- `WeatherNewsApp.tsx` — Add `<h1>` "Weather & News"
- `DPOOnboarding.tsx` — Add `<h1>` "Digital Presence Onboarding"
- `PlatformTruthDashboard.tsx` — Add `<h1>` "Platform Truth Dashboard"
- `OnboardingWrapper.tsx` — Add `<h1 className="sr-only">Setup</h1>` (wrapper for OSSetupExperience)

### Implementation Pattern

For Category A (wrappers): Add `<h1 className="sr-only">{name}</h1>` right after the opening `<div>`.

For Categories B/C/D: Add `SitaPageHeader` from `@/components/sita/SitaCard` with appropriate title/subtitle, consistent with the rest of the app.

## Files Changed
- **0 files** for Section 11 (already wired)
- **18 files** updated for Section 17 (heading accessibility)

