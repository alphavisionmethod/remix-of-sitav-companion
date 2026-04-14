

# Adaptive Profile System — Full Implementation Plan

## Current State Assessment

The codebase already has **substantial** adaptive infrastructure:

- **Business Profile Engine** (`business-profile-engine.ts`, 644 lines) — full weight computation, archetype mapping, operating flags, CRM adaptation, advisor roster, boardroom focus, workflow suggestions, cross-domain signals
- **BusinessProfileEditor** (287 lines) — weight sliders, confidence meter, operating flags, CRM language preview, sidebar priority, KPIs, advisors
- **ProfileEvolutionPanel** (184 lines) — drift detection, suggestions with accept/dismiss, mock signals
- **AdaptiveEmptyState** (153 lines) — archetype-aware empty states for all page contexts
- **BusinessModeOnboardingPreview** (234 lines) — profile reveal during onboarding with module/advisor/workflow previews
- **AdaptiveWorkflowTemplates** (148 lines) — profile-filtered template gallery with trust gates
- **AdaptiveBusinessHome** (207 lines) — profile-shaped dashboard with quick actions, stat cards, identity layers
- **AdaptiveBoardroomAgenda, AdaptiveKPIDashboard, AdaptiveSmartSuggestions, AdaptiveCRMConfig, BusinessHomeWidgetRegistry, CrossDomainSignalBridge** — all exist

**What's missing or needs major upgrade** to match the spec:

1. **Profile Editing Center** — Current editor is functional but basic (just sliders). Missing: module emphasis toggles, quick action configuration, advisor configuration, Boardroom focus configuration, live Business Home preview panel, before/after compare mode
2. **Onboarding Previews** — Component exists but lacks starter pack recommendations, side-by-side mode comparison, interactive preview cards
3. **Profile Change Suggestions** — Evolution panel exists but lacks inline Business Home suggestion cards, preview-before-apply mode, profile evolution timeline visualization
4. **Templates** — Workflow templates exist but missing CRM pipeline templates, quote templates, communication draft templates, dashboard composition templates, Boardroom agenda templates as selectable packs
5. **Empty States** — Config exists but lacks beautiful visual treatment, aspirational illustrations, recommendation cards
6. **Beautiful UX** — Current components are functional but text-heavy. Need premium visual dashboards, animated previews, wow moments

---

## Implementation Plan (6 Batches)

### Batch 1: Profile Editing Center Upgrade
**Expand `BusinessProfileEditor.tsx` into a full-featured studio**

- **Module Emphasis Panel** — Toggle grid for enabling/disabling emphasis on Leads, CRM, Quotes, Scheduling, Follow-Through, Collections, Advisors, Boardroom, Recovery, Operations. Each toggle shows current emphasis level (primary/secondary/hidden) with animated transitions
- **Quick Actions Configurator** — Drag-sortable list of available quick actions grouped by context (homepage, lead, morning briefing, end-of-day). Profile-aware defaults with "reset to recommended" option
- **Advisor Configuration Panel** — Card grid of available advisors with toggle active/inactive, opinionation slider (conservative ↔ aggressive), module scope checkboxes, and emphasis focus selector (risk/growth/execution/strategic)
- **Boardroom Focus Editor** — Checklist of focus areas (strategic accounts, proposal bottlenecks, staffing, margin risk, collections, capacity, hiring, enterprise opportunities) with profile-aware defaults
- **Live Preview Sidebar** — Right-side panel showing miniature Business Home preview that updates in real-time as profile weights/toggles change. Includes before/after toggle

### Batch 2: Profile-Aware Template Packs
**New component: `ProfileTemplateGallery.tsx`**

- **CRM Pipeline Templates** — Per-archetype stage configurations (Service: Lead→Consultation→Proposal→Won; B2B: Target→Discovery→Stakeholder→Negotiation→Closed; etc.) with visual stage preview cards
- **Quote/Proposal Templates** — Simple estimate, consult-based proposal, enterprise proposal, recurring package, custom order. Each with preview thumbnail and archetype affinity badge
- **Communication Draft Templates** — First response, quote follow-up, consult reminder, reactivation outreach, local appointment reminder. Editable preview with profile-aware language
- **Dashboard Composition Templates** — Visual thumbnails showing different Business Home layouts (service-focused, ecommerce-focused, team-focused, etc.) with one-click apply
- **Boardroom Agenda Templates** — Per-archetype agenda structures with preview and apply
- **Starter Pack System** — Bundle templates into "Apply Pack" one-click setup (e.g., "Service Business Starter" applies pipeline + workflows + home layout + advisors)
- Wire into BusinessAppShell sidebar as "Templates" route

### Batch 3: Enhanced Profile Evolution & Suggestions
**Upgrade `ProfileEvolutionPanel.tsx` with visual timeline and inline suggestions**

- **Profile Evolution Timeline** — Visual timeline/sparkline showing how the profile has shifted over time (mock data for demo, real signals in production). Each point shows the dominant archetype and confidence
- **Inline Business Home Suggestions** — Soft suggestion cards embedded in AdaptiveBusinessHome showing detected drift with "Preview This Change" interaction
- **Preview-Before-Apply Mode** — Split-screen showing current vs. proposed profile state with animated transitions between the two Business Home compositions
- **Suggestion Detail Drawer** — Expandable drawer showing: what signal triggered the suggestion, what would change (modules, widgets, advisors, KPIs), accept/dismiss/snooze/customize actions
- **Celebration Micro-animation** — Subtle confetti/glow effect when a better-fit profile is applied

### Batch 4: Beautiful Empty States Upgrade
**Enhance `AdaptiveEmptyState.tsx` with premium visual treatment**

- **Aspirational Illustrations** — SVG-based abstract illustrations per archetype (geometric patterns in brand colors) that visualize what the empty area will become
- **Animated Entry** — Staggered fade-in with scale for empty state elements
- **Recommendation Cards** — Profile-aware "What to do next" cards with priority ordering and estimated time-to-value
- **Connection Prompts** — Profile-aware integration suggestions ("Because your business is appointment-heavy, connecting scheduling will make this area much more powerful")
- **Progress Indicators** — Show setup completion percentage for each module area
- Cover all major surfaces: Business Home, Leads, Lead Inbox, Quotes, Boardroom, CRM, Tasks

### Batch 5: Onboarding Preview Enhancement
**Upgrade `BusinessModeOnboardingPreview.tsx` with wow moments**

- **Side-by-Side Mode Comparison** — Interactive cards showing how Business OS differs between archetypes before final selection
- **Animated Environment Reveal** — Cinematic sequence showing the OS "configuring itself" with module emphasis animations, advisor stack preview, and dashboard composition morphing
- **Starter Pack Recommendation** — "Most service businesses choose this setup" with one-click application
- **Generated Business Operating Style Summary** — Text card summarizing the detected profile in natural language with confidence indicator
- **Interactive Preview Cards** — Clickable module cards that expand to show what each adapted module will look like

### Batch 6: Integration Wiring & Dashboard Polish
**Wire everything together and add premium visual dashboards**

- **Profile System Dashboard** — New route "profile-studio" in BusinessAppShell combining: profile editor, module emphasis, advisor config, Boardroom focus, template gallery, evolution timeline — all in a tabbed premium layout
- **Notification/Suggestion Engine Integration** — Connect profile drift suggestions to AdaptiveNotificationCenter and AdaptiveSmartSuggestions so they appear inline in Business Home
- **Cross-Domain Signal Bridge Enhancement** — Emit profile changes to Finance and Concierge domains so they can adapt their own surfaces
- **Empty State Engine Wiring** — Ensure all major modules (leads, CRM contacts, pipeline, quotes, tasks, communications, Boardroom) use AdaptiveEmptyState with the upgraded visual treatment
- **Visual Polish Pass** — Add gradient stat cards, mini-chart sparklines, animated emphasis indicators, glassmorphic card treatments across all adaptive surfaces

---

## Technical Details

- All new components live in `src/components/business/adaptive/` following existing patterns
- Profile engine extensions stay in `src/lib/engines/` (template pack definitions, suggestion engine enhancements)
- Uses existing `BusinessProfileCtx` and `useBusinessProfile` hook — no new context needed
- Routes wired through existing `MODULE_COMPONENTS` map in `BusinessAppShell.tsx`
- No new dependencies required (framer-motion, lucide-react already available)
- Estimated ~2,500 lines of new/modified code across 6 batches

