

# Business OS — Full Feature Adaptation Map Implementation

## Overview
Wire every remaining Business OS page with archetype-aware adaptation using the existing `useBusinessProfile` hook, `getIdentityLayer`, and the Business Profile Engine. This covers 18+ unwired pages across all sidebar groups, plus new adaptation infrastructure for sections not yet covered (Support, Operations, Follow-Through, Appointments, Boardroom, etc.).

## Current State
- **Engine**: Fully built — 644-line `business-profile-engine.ts` with weights, CRM adaptation, advisors, boardroom, workflows, KPIs, cross-domain signals
- **Identity Layers**: 393-line `business-identity-layers.ts` with per-archetype visual tone, copy, density, greeting
- **Wired pages**: 12 pages (CRM Home/Contacts/Pipeline/Health/Segments/Automations/Import, Leads, Invoices, Proposals, Forecast, ContactDetail)
- **Unwired pages**: ~18 pages need adaptation wiring
- **Missing infrastructure**: No per-page adaptation configs for Support, Operations, Follow-Through, Appointments, Quotes, Collections, Documents, Boardroom, Recovery, Proof

## Batch Plan

### Batch 1: Adaptation Data Layer — New per-module adaptation configs
**New file: `src/lib/engines/business-module-adaptations.ts`** (~400 lines)

A single exhaustive config file that maps every Business module to per-archetype adaptations:
- **Support**: Issue categories, severity language, SLA emphasis, escalation paths per type
- **Operations**: Queue labels, process categories, bottleneck definitions per type  
- **Follow-Through**: Queue types, urgency rules, recovery language per type
- **Appointments**: Visibility toggle (high for appointment-based, low for ecommerce), terminology, prep emphasis
- **Quotes**: Emphasis level (high for service/agency, low for ecommerce), template types, terminology
- **Collections**: Tone sensitivity, escalation ladder style, aging bucket labels per type
- **Documents**: Category emphasis (proposals for service, orders for ecommerce), document types shown
- **Lead Recovery**: Recovery strategy labels (cart recovery vs proposal follow-up vs appointment rebooking)
- **Communications**: Channel emphasis, message types, draft templates per type
- **Boardroom**: Already has `BoardroomFocus` in engine — extend with per-module agenda items
- **Proof/Trust**: Receipt types, proof categories per archetype
- **Opportunities**: Deal terminology, stage names, value labels per type

Each config exports a `getModuleAdaptation(moduleId, primaryMode)` function returning typed adaptation objects.

### Batch 2: Wire Core group pages (6 pages)
Wire `useBusinessProfile` + `getIdentityLayer` + `getModuleAdaptation` into:

1. **CustomerSupportCenter.tsx** — Adapt issue categories (order issues for ecommerce, service complaints for service, scheduling issues for appointment-based), SLA labels, escalation language, advisor specialty
2. **BusinessOperations.tsx** — Adapt queue categories (fulfillment for ecommerce, assignments for employee-based, schedule flow for appointment-based), bottleneck labels, team emphasis
3. **FollowThroughCenter.tsx** — Adapt queue tabs (cart recovery for ecommerce, quote follow-up for service, reminder loops for appointment-based), urgency thresholds, recovery language
4. **AppointmentsScheduling.tsx** — Adapt visibility/emphasis (primary for appointment-based, secondary for service, hidden for pure ecommerce), terminology (sessions/visits/appointments), prep emphasis
5. **BusinessOverview.tsx** — Adapt hero metrics, widget composition, pulse summary per archetype
6. **OpportunitiesCenter.tsx** — Adapt deal terminology (orders/jobs/projects/deals), stage names, value labels

### Batch 3: Wire Sales + Growth pages (6 pages)
1. **QuotesWorkspace.tsx** — Adapt emphasis level, template suggestions, terminology (quotes/estimates/offers), follow-up urgency
2. **CollectionsCommandCenter.tsx** — Adapt escalation tone (sensitive for service/agency, direct for ecommerce), aging labels, chase sequence style
3. **LeadRecovery.tsx** — Adapt recovery strategies (cart recovery campaigns for ecommerce, proposal follow-up for service, rebooking sequences for appointment-based)
4. **EcommerceManager.tsx** — Show/hide based on archetype weight, adapt store metrics
5. **SocialCommand.tsx** — Adapt channel emphasis, content strategy suggestions per type
6. **WebsiteBuilder.tsx** — Adapt template suggestions, CTA types per business model

### Batch 4: Wire System + remaining CRM pages (8 pages)
1. **BusinessBoardroom.tsx** — Wire boardroom focus areas, KPI emphasis, agenda priorities from profile
2. **BusinessProof.tsx** — Adapt proof categories, receipt types per archetype
3. **BusinessDocuments.tsx** — Adapt document categories, emphasis (proposals for service, orders for ecommerce)
4. **CommunicationsCenter.tsx** — Adapt channel types, message templates, draft suggestions
5. **CRMCompanies.tsx** — Adapt company terminology (accounts/stores/practices)
6. **CRMTimeline.tsx** — Adapt timeline event emphasis per type
7. **CRMTasks.tsx** — Adapt task categories, urgency language
8. **CRMNotes.tsx** — Adapt note templates, suggested topics

### Batch 5: Adaptive Sidebar Intelligence + Dynamic Sidebar
Enhance the existing `adaptive-sidebar-intelligence.ts` to:
- Dynamically show/hide sidebar items based on archetype (hide Appointments for pure ecommerce, hide E-Commerce for pure service)
- Adjust badge counts and severity per archetype context
- Reorder items within groups based on archetype priority
- Wire into `BusinessAppShell.tsx` sidebar rendering

### Batch 6: Profile-Aware Templates + Evolution Suggestions
1. **Enhance AdaptiveOnboardingWizard.tsx** — Add "here's how Business OS will look" preview step showing adapted sidebar, home widgets, and advisors
2. **Enhance ProfileEvolutionPanel.tsx** — Add runtime suggestions ("Your business looks more appointment-heavy now — adjust?")
3. **New: AdaptiveWorkflowTemplates.tsx** — Profile-aware workflow template gallery showing only relevant automations
4. **New: AdaptiveBoardroomAgenda.tsx** — Auto-composed boardroom agenda based on archetype priorities

## Technical Pattern (consistent across all pages)
```typescript
import { useBusinessProfile } from "@/hooks/useBusinessProfile";
import { getIdentityLayer } from "@/lib/engines/business-identity-layers";
import { getModuleAdaptation } from "@/lib/engines/business-module-adaptations";

const MyPage = () => {
  const { primaryMode, adaptations } = useBusinessProfile();
  const identity = getIdentityLayer(primaryMode);
  const moduleConfig = getModuleAdaptation("support", primaryMode);
  // Use moduleConfig for labels, categories, emphasis, advisor specialty
  // Use identity for tone, colors, greeting style
  // Use adaptations.crm for CRM-specific language
};
```

## What Stays Constant
- Premium design quality and component system (SitaCard, HeroCard, QueueCard, etc.)
- Trust/proof model architecture
- Advisor visibility and Boardroom availability  
- Command palette integration
- State persistence and continuity
- Import/connectivity support
- Activity timeline structure

## Files Summary
| File | Action | Batch |
|------|--------|-------|
| `src/lib/engines/business-module-adaptations.ts` | Create — exhaustive per-module configs | 1 |
| `CustomerSupportCenter.tsx` | Wire adaptation | 2 |
| `BusinessOperations.tsx` | Wire adaptation | 2 |
| `FollowThroughCenter.tsx` | Wire adaptation | 2 |
| `AppointmentsScheduling.tsx` | Wire adaptation | 2 |
| `BusinessOverview.tsx` | Wire adaptation | 2 |
| `OpportunitiesCenter.tsx` | Wire adaptation | 2 |
| `QuotesWorkspace.tsx` | Wire adaptation | 3 |
| `CollectionsCommandCenter.tsx` | Wire adaptation | 3 |
| `LeadRecovery.tsx` | Wire adaptation | 3 |
| `EcommerceManager.tsx` | Wire adaptation | 3 |
| `SocialCommand.tsx` | Wire adaptation | 3 |
| `WebsiteBuilder.tsx` | Wire adaptation | 3 |
| `BusinessBoardroom.tsx` | Wire adaptation | 4 |
| `BusinessProof.tsx` | Wire adaptation | 4 |
| `BusinessDocuments.tsx` | Wire adaptation | 4 |
| `CommunicationsCenter.tsx` | Wire adaptation | 4 |
| `CRMCompanies.tsx`, `CRMTimeline.tsx`, `CRMTasks.tsx`, `CRMNotes.tsx` | Wire adaptation | 4 |
| `adaptive-sidebar-intelligence.ts` | Enhance dynamic show/hide | 5 |
| `BusinessAppShell.tsx` | Wire dynamic sidebar | 5 |
| `AdaptiveOnboardingWizard.tsx` | Add preview step | 6 |
| `ProfileEvolutionPanel.tsx` | Add runtime suggestions | 6 |
| `AdaptiveWorkflowTemplates.tsx` | Create — template gallery | 6 |
| `AdaptiveBoardroomAgenda.tsx` | Create — auto-composed agenda | 6 |

No database changes needed.

