# SITA OS — UX Experience System Architecture

## Overview

The UX Experience System is a comprehensive set of codified principles, components, hooks, and copy engines that ensure every surface in SITA OS meets production-grade quality for trust, honesty, accessibility, and premium feel.

## Core Principles (7)

| Principle | Key Rule | Enforcement |
|-----------|----------|-------------|
| **Premium** | ≤24 visible elements per surface | Recommended |
| **Calm** | Suppress non-critical UI at cognitive load >75% | Required |
| **Context** | Every surface provides orientation cues | Required |
| **Explainability** | AI outputs must include confidence + source | Required |
| **Honesty** | Stale data, demo mode, degradation must be visible | Required |
| **Density** | 3-layer progressive disclosure for complex surfaces | Recommended |
| **Trust** | Destructive actions require consequence preview | Required |

### Runtime Audit

```typescript
import { auditPrinciples } from "@/lib/ux-trust";

const result = auditPrinciples({
  cognitiveLoad: 45,
  isFocusMode: false,
  isDestructive: false,
  hasAIContent: true,
  isStaleData: false,
  isDegraded: false,
  visibleElements: 18,
  isDemo: false,
});
// result.passed / result.failed / result.results[]
```

## Microcopy System

Centralized copy engine replacing ad-hoc strings across the codebase.

| Category | Function | Use Case |
|----------|----------|----------|
| Error | `getErrorCopy()` | What failed, what works, what to do next |
| AI | `getAICopy()` | Confidence-graded labels and review prompts |
| Action | `getActionCopy()` | Consequence-aware button labels |
| State | `getStateCopy()` | Loading/degraded/stale/empty templates |
| Freshness | `getFreshnessCopy()` | Human-readable data age |

## Component Inventory

### Primitives

| Component | Purpose |
|-----------|---------|
| `DataFreshnessBadge` | Shows data age with auto-staleness detection |
| `AIConfidenceDisclosure` | Standardized AI output framing (confidence + source + review) |

### Surfaces

| Component | Purpose |
|-----------|---------|
| `ContextOrientationBar` | "Where am I / what changed / what can I do" strip |
| `InformationLayerSurface` | 3-layer progressive disclosure (Summary → Detail → Deep) |
| `ActionConsequencePreview` | Consequence preview for destructive/irreversible actions |

### Guards & Banners

| Component | Purpose |
|-----------|---------|
| `CognitiveLoadGuard` | Suppresses non-critical UI when cognitive load is high |
| `DegradedServiceBanner` | Per-service degradation with retry/dismiss |
| `RecoveryPrompt` | Resume interrupted drafts, uploads, workflows |

### Hooks

| Hook | Purpose |
|------|---------|
| `useUndoableAction` | Wraps destructive mutations with configurable undo delay |
| `useStaleData` | Tracks data freshness with automatic aging |
| `useQueryFreshness` | Extracts freshness from React Query results |

## Trust Score (16 checks)

The trust score audits surface quality across 16 dimensions:

**Original 8:** DemoModeBadge, NetworkStatusBar, ConfirmationDialog, DataFreshnessBadge, ContextualEmptyState, OptimisticMutation, ActionFeedback, UndoToast

**New 8:** AIConfidenceDisclosure, ContextOrientation, RecoveryPrompt, CognitiveLoadGuard, ActionConsequencePreview, DegradedServiceBanner, InformationLayers, MicrocopySystem

Grades: A+ (≥95%), A (≥85%), B (≥70%), C (≥55%), D (≥40%), F (<40%)

## Integration Patterns

### Adding AI Confidence to a Surface

```tsx
import { AIConfidenceDisclosure } from "@/components/sita/primitives";

<AIConfidenceDisclosure
  confidence={0.82}
  outputType="recommendation"
  sourceSummary="Based on 3 months of transaction data"
/>
```

### Wrapping Destructive Actions

```tsx
import { useUndoableAction } from "@/hooks/use-undoable-action";

const { execute } = useUndoableAction({
  label: "Delete invoice",
  onExecute: () => deleteInvoice(id),
  onUndo: () => restoreInvoice(id),
});
```

### Using Information Layers

```tsx
import { InformationLayerSurface } from "@/components/sita/surfaces/InformationLayerSurface";

<InformationLayerSurface
  summary={<SummaryCard />}
  detail={<DetailSignals />}
  deep={<AuditLog />}
/>
```

## File Map

| File | Type |
|------|------|
| `src/lib/ux-trust/ux-principles.ts` | Principles engine |
| `src/lib/ux-trust/microcopy-system.ts` | Copy engine |
| `src/lib/ux-trust/ux-trust-score.ts` | Trust score (16 checks) |
| `src/lib/ux-trust/index.ts` | Barrel export |
| `src/components/sita/primitives/AIConfidenceDisclosure.tsx` | AI confidence primitive |
| `src/components/sita/surfaces/ContextOrientationBar.tsx` | Orientation bar |
| `src/components/sita/surfaces/InformationLayerSurface.tsx` | Progressive disclosure |
| `src/components/sita/surfaces/ActionConsequencePreview.tsx` | Consequence preview |
| `src/components/sita/CognitiveLoadGuard.tsx` | Load guard |
| `src/components/sita/DegradedServiceBanner.tsx` | Service degradation |
| `src/components/sita/RecoveryPrompt.tsx` | Flow recovery |
| `src/hooks/use-undoable-action.ts` | Undo hook |
