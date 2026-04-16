

# SITA OS — Final User Experience System Implementation

## What Already Exists (Strong Foundation)

The codebase already has significant UX infrastructure:

- **PremiumEmptyState** (9 variants, domain-aware, animated)
- **Contextual empty states** per domain (10 domains configured)
- **PageTruthBanner** (demo/live/partial/connecting/degraded)
- **RealityStateBadge** (6 state classes)
- **ErrorBoundary** (3 levels: Global, Route, Window)
- **SectionSkeleton / PageSkeleton / LoadingState** components
- **UX Trust Score** calculator (8 checks)
- **OfflineBanner** with connectivity quality indicators
- **useReducedMotion** hook (used in 80+ files)
- **useSessionRestore** for continuity
- **useAction** hook with toast feedback
- **Cognitive load tracking** in attention OS
- **Domain atmospheres** (4 domains with tone/density/radius)
- **4-surface material hierarchy** (tokens)
- **TrustBadge** (9 trust levels)
- **Focus management** registered in surface registry

## What's Missing

| Gap | Impact |
|-----|--------|
| No unified UX Principles engine (codified principles are scattered) | High |
| No microcopy system (error/AI/action copy is ad-hoc per component) | High |
| No `DataFreshnessBadge` component (referenced in trust score but missing) | High |
| No `UndoableAction` component/hook (referenced but not implemented) | High |
| No `InformationLayerSurface` progressive disclosure wrapper | Medium |
| No `CognitiveLoadGuard` (attention OS tracks load but doesn't throttle UI) | Medium |
| No `AIConfidenceDisclosure` component (AI surfaces lack standardized confidence display) | High |
| No `DegradedServiceBanner` (per-service degradation, not just offline) | Medium |
| No `ContextOrientationBar` ("where am I / what changed / what can I do") | High |
| No `RecoveryPrompt` for interrupted flows (draft/upload/navigation) | Medium |
| Empty states not wired to all pages consistently | Medium |
| No `ActionConsequencePreview` for destructive/irreversible actions | Medium |

## Implementation Plan

### 1. UX Principles Engine (`src/lib/ux-trust/ux-principles.ts`)

Codified UX principles as a typed registry that components can query at runtime to enforce behavior contracts. Maps each of the 7 core principles (Premium, Calm, Context, Explainability, Honesty, Density, Trust) to concrete behavioral rules with component-level enforcement helpers.

### 2. Microcopy System (`src/lib/ux-trust/microcopy-system.ts`)

Centralized copy engine for:
- **Error copy**: structured templates (what failed, what works, what to do next)
- **AI copy**: confidence-graded language ("Suggestion", "High-confidence recommendation", "Uncertain estimate")
- **Action copy**: consequence-aware button labels
- **State copy**: loading/degraded/stale templates
- **Empty state copy**: already exists, wire into this system

Each template takes context parameters and returns human-readable, premium-toned copy.

### 3. DataFreshnessBadge Component (`src/components/sita/primitives/DataFreshnessBadge.tsx`)

Displays data age with automatic staleness detection:
- Fresh (< 5min): green dot, "Just now" / "2 min ago"
- Aging (5-30min): amber, "12 min ago"
- Stale (30min+): red, "2 hours old — may be outdated"
- Unknown: gray, "Age unknown"

Configurable thresholds per domain (finance = stricter, concierge = relaxed).

### 4. AIConfidenceDisclosure Component (`src/components/sita/primitives/AIConfidenceDisclosure.tsx`)

Standardized AI output framing:
- Shows confidence level (High/Medium/Low/Unknown)
- Labels output as "Suggestion" vs "Recommendation" vs "Analysis"
- Shows data source summary when available
- Shows "Human review recommended" when confidence < threshold
- Shows "This result is simulated" when in demo mode
- Integrates with existing TrustBadge and PageTruthBanner

### 5. UndoableAction Hook + Toast (`src/hooks/use-undoable-action.ts`)

Production undo pattern:
- Wraps destructive mutations with a configurable delay (default 5s)
- Shows toast with undo button and countdown
- On undo: cancels the pending mutation, restores optimistic state
- On timeout: executes the real mutation
- Integrates with `useAction` for kernel-routed mutations

### 6. ContextOrientationBar (`src/components/sita/surfaces/ContextOrientationBar.tsx`)

Persistent orientation strip answering core cognitive questions:
- **Where am I**: breadcrumb with domain icon + page name
- **What changed**: "3 items updated since last visit" badge
- **Data state**: Fresh/Stale/Demo badge (uses DataFreshnessBadge)
- **What can I do**: top 2-3 contextual quick actions
- Auto-hides in focus/calm mode, always visible in analyst mode

### 7. InformationLayerSurface (`src/components/sita/surfaces/InformationLayerSurface.tsx`)

3-layer progressive disclosure wrapper:
- **Layer 1** (always visible): title, state, importance, top metrics, main actions
- **Layer 2** (expandable): sub-status, signals, recent changes, confidence
- **Layer 3** (drill-down): logs, history, provenance, receipts, raw details

Animates between layers with framer-motion. Each layer has semantic ARIA labeling.

### 8. CognitiveLoadGuard (`src/components/sita/CognitiveLoadGuard.tsx`)

Reads from attention OS cognitive load score:
- When load > 75%: suppresses non-critical notifications, reduces widget density
- When load > 90%: shows "Focus mode suggested" prompt
- Wraps sections that should auto-collapse under high load
- Respects user override ("Show anyway")

### 9. DegradedServiceBanner (`src/components/sita/DegradedServiceBanner.tsx`)

Per-service degradation communication:
- Shows which specific service is degraded (not just "offline")
- Shows what functionality is limited
- Shows what still works
- Offers retry or fallback
- Auto-dismisses when service recovers
- Stacks gracefully when multiple services degrade

### 10. ActionConsequencePreview (`src/components/sita/surfaces/ActionConsequencePreview.tsx`)

For destructive/irreversible actions:
- Shows what will happen
- Shows what is reversible vs permanent
- Shows affected items count
- Shows related downstream effects
- Requires explicit confirmation with consequence acknowledgment
- Integrates with ApprovalGate for high-trust actions

### 11. RecoveryPrompt (`src/components/sita/RecoveryPrompt.tsx`)

Detects interrupted flows and offers to resume:
- Unsaved drafts (reads from useDraftAutosave)
- Interrupted file uploads
- Abandoned multi-step workflows
- Last session restore prompt
- Shows "Continue where you left off" or "Start fresh"
- Non-intrusive: appears as a dismissible card, not a modal

### 12. Enhanced UX Trust Score (`src/lib/ux-trust/ux-trust-score.ts`)

Extend existing 8-check scorer with new checks:
- HasDataFreshnessBadge ✓ (now real component)
- HasUndoToast ✓ (now real hook)
- HasAIConfidenceDisclosure (new)
- HasContextOrientation (new)
- HasRecoveryPrompt (new)
- HasCognitiveLoadGuard (new)
- HasActionConsequencePreview (new)
- HasDegradedServiceBanner (new)

Total: 16 checks, weighted by user-impact severity.

### 13. Wiring: Update Key Pages

Wire new components into existing surfaces:
- **ShellLayout.tsx**: Add ContextOrientationBar, CognitiveLoadGuard wrapper, RecoveryPrompt
- **DomainAppShell**: Add DataFreshnessBadge to domain headers
- **AI surfaces** (AdvisorChat, LiveAdvisorCard, AIResponsePanel): Add AIConfidenceDisclosure
- **Destructive actions** (delete flows, approval gates): Add ActionConsequencePreview
- **All domain dashboards**: Ensure PremiumEmptyState is used consistently

### 14. Architecture Doc (`docs/architecture/UX_EXPERIENCE_SYSTEM.md`)

Comprehensive documentation of the entire UX system: principles, components, copy system, trust scoring, and integration patterns.

## Files Summary

| Category | New Files | Modified Files |
|----------|-----------|----------------|
| UX Principles + Microcopy | 2 | 0 |
| New Primitives/Components | 7 | 0 |
| New Hook | 1 | 0 |
| Enhanced Trust Score | 0 | 1 |
| Wiring into shell/pages | 0 | 4 |
| Documentation | 1 | 0 |
| Barrel updates | 0 | 2 |
| **Total** | **~11** | **~7** |

## Implementation Order

1. Microcopy system + UX principles (foundation for all copy)
2. DataFreshnessBadge + AIConfidenceDisclosure (primitive components)
3. UndoableAction hook (action infrastructure)
4. ContextOrientationBar + InformationLayerSurface (layout components)
5. CognitiveLoadGuard + DegradedServiceBanner + ActionConsequencePreview + RecoveryPrompt
6. Enhanced UX Trust Score
7. Wiring into shell and key pages
8. Documentation

