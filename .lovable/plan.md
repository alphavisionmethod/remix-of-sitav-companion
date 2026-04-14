

# Business Profile Engine — Remaining Integration Gaps

## What's Already Done (no duplication needed)
- `business-profile-engine.ts` — 585 lines, full engine with 12 archetypes, weighted computation, manual overrides, localStorage persistence
- `BusinessProfileContext.tsx` + `useBusinessProfile.ts` — context and hook
- `AdaptiveBusinessHome.tsx` — full adaptive dashboard with widgets, stat cards, KPIs, quick actions
- `BusinessProfileEditor.tsx` — weight sliders, flag display, adaptation preview
- `AdaptiveCRMConfig.ts` — quick actions and stat cards per archetype
- `BusinessHomeWidgetRegistry.ts` — 25+ widgets with affinity scores
- `adaptive-advisor-roster.ts` — per-archetype advisor capabilities and personalities
- `adaptive-boardroom-framing.ts` — per-archetype agenda items
- `adaptive-workflow-templates.ts` — template suggestions
- `BusinessAppShell.tsx` — wrapped in provider, sidebar reorders by profile

## What's NOT Yet Wired (the gaps)

### 1. CRMContacts — no profile consumption
Static columns and fields. Should use `useBusinessProfile()` to adapt visible columns, sort priority, and contact label language.

### 2. CRMPipeline — no profile consumption  
Static pipeline stages. Should use `useBusinessProfile()` to show adaptive stage names from `adaptations.crm.pipelineStages` and adapt language.

### 3. CRMAutomations — no profile consumption
No suggested templates from the engine. Should show "Suggested for your business" section using `adaptive-workflow-templates.ts`.

### 4. BusinessBoardroom — static advisors, no profile consumption
Hardcoded 4 advisors. Should use `adaptive-boardroom-framing.ts` for focus areas and `adaptive-advisor-roster.ts` for advisor stack.

### 5. CRMImportCenter — no adaptive import hints
Should show per-archetype field mapping suggestions (Section P from prompt).

### 6. Sidebar badge adaptation
`BusinessAppShell` sorts groups but doesn't adapt badge labels/counts per archetype (e.g., ecommerce shows "Carts: 23", service shows "Proposals: 8").

### 7. Profile confidence display
Engine has no confidence score. Add `profileConfidence` to `BusinessProfileResult` and display in ProfileEditor.

### 8. Cross-domain signals
No integration with Finance or Concierge contexts. Add lightweight signal dispatches.

---

## Implementation Plan — 4 Batches

### Batch 1: Wire CRM pages to profile (3 files)
- **CRMContacts.tsx** — Import `useBusinessProfile`, use `adaptations.crm.language.contactLabel` for header, reorder columns based on `adaptations.crm.priorityFields`, hide fields from `adaptations.crm.hiddenFields`
- **CRMPipeline.tsx** — Import `useBusinessProfile`, use `adaptations.crm.pipelineStages` for stage names, use `adaptations.crm.language.dealLabel` and `pipelineLabel` for headers
- **CRMAutomations.tsx** — Import `useBusinessProfile` + `getWorkflowSuggestions`, add "Suggested Workflows" section at top showing engine-recommended templates with affinity scores

### Batch 2: Wire Boardroom + Import (2 files)
- **BusinessBoardroom.tsx** — Import `useBusinessProfile`, replace hardcoded `businessAdvisors` with `getTopAdvisors(profile)` mapped to `AdvisorConfig`, use `getBoardroomAgenda(profile)` for agenda items, use `profile.boardroom.reviewMode` for default tab
- **CRMImportCenter.tsx** — Import `useBusinessProfile`, add "Smart Field Suggestions" banner showing recommended import fields based on archetype (e.g., ecommerce → order_history, cart_status; service → proposal_status, invoice_status)

### Batch 3: Sidebar badges + Profile confidence (3 files)
- **business-profile-engine.ts** — Add `profileConfidence: number` (0-1) to `BusinessProfileResult`, computed from how many input signals contributed to weights
- **BusinessAppShell.tsx** — Use `adaptations.sidebar.badgeOverrides` to dynamically set badge labels per archetype on sidebar items (e.g., ecommerce mode → "lead-recovery" badge becomes "Cart Recovery: 5")
- **BusinessProfileEditor.tsx** — Add confidence meter showing how certain the engine is about the classification, with explanation of contributing signals

### Batch 4: Cross-domain + adaptive record layout (3 files)
- **business-profile-engine.ts** — Add `crossDomainSignals` to result: finance emphasis (invoice/collections for service, AOV for ecommerce), concierge emphasis (calendar prep for appointment-based, staffing for local)
- New: **`src/components/business/adaptive/AdaptiveContactLayout.tsx`** — Adaptive contact detail sections that reorder based on archetype: ecommerce shows order history first, service shows communication/proposal first, local shows visit history first
- **CRMContactDetail.tsx** — Consume `AdaptiveContactLayout` to reorder detail sections

## Files Changed

| File | Batch | Change |
|------|-------|--------|
| `src/pages/business/CRMContacts.tsx` | 1 | Add profile-driven columns and language |
| `src/pages/business/CRMPipeline.tsx` | 1 | Add profile-driven stage names and language |
| `src/pages/business/CRMAutomations.tsx` | 1 | Add suggested workflows section |
| `src/pages/business/BusinessBoardroom.tsx` | 2 | Replace static advisors with adaptive roster |
| `src/pages/business/CRMImportCenter.tsx` | 2 | Add smart field suggestions |
| `src/lib/engines/business-profile-engine.ts` | 3 | Add profileConfidence + crossDomainSignals |
| `src/components/sita/apps/business/BusinessAppShell.tsx` | 3 | Apply badge overrides from profile |
| `src/components/business/adaptive/BusinessProfileEditor.tsx` | 3 | Add confidence meter |
| New: `src/components/business/adaptive/AdaptiveContactLayout.tsx` | 4 | Archetype-aware contact detail sections |
| `src/components/business/crm/CRMContactDetail.tsx` | 4 | Use adaptive layout |

No database changes needed.

