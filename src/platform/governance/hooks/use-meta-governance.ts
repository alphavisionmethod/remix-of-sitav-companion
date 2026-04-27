// ═══════════════════════════════════════════════════════════════
// SITA OS — Meta-Governance React Hooks
// All hooks consume the singleton MetaGovernanceEngine.
// No scoring logic lives here — pure data access.
// ═══════════════════════════════════════════════════════════════

import { useMemo, useCallback, useState } from "react";
import { getMetaGovernanceEngine } from "@/domains/engines/meta-governance-engine";
import type { ReadinessInput } from "@/domains/engines/readiness-engine";
import type {
  TrustDebtRecord, TrustDebtCategory, TrustDimension,
  ExecutionDebtRecord, ExecutionDebtCategory,
  DragIndex, DragDimension,
  ReadinessScore, DelegationTier,
  RecurringDelegationRecord,
  LaborBurdenScore, LaborEqualizationSuggestion,
  FounderBottleneckEvent,
  WorkspaceViewMode, ViewModelFilter,
  GovernanceBoardroomSection, TrendWindow,
} from "@/lib/types/meta-governance.types";
import type { EntityScope, OSDomain } from "@/lib/types/os-unified.types";

// ── Trust Debt ──────────────────────────────────────────────────

export function useTrustDebtLedger() {
  const engine = getMetaGovernanceEngine();
  return {
    ledger: engine.trustDebt.getLedger(),
    unresolvedCounts: engine.trustDebt.getUnresolvedCounts(),
    debtScore: engine.trustDebt.computeDebtScore(),
    getByDimension: (d: TrustDimension) => engine.trustDebt.getByDimension(d),
    getByCategory: (c: TrustDebtCategory) => engine.trustDebt.getByCategory(c),
    getByDomain: (d: OSDomain) => engine.trustDebt.getByDomain(d),
    boardroomSection: engine.trustDebt.getBoardroomSection(),
  };
}

export function useTrustDebtTrend(periodMs: number = 7 * 24 * 60 * 60 * 1000) {
  const engine = getMetaGovernanceEngine();
  return engine.trustDebt.computeTrend(periodMs);
}

// ── Execution Debt ──────────────────────────────────────────────

export function useExecutionDebtLedger() {
  const engine = getMetaGovernanceEngine();
  return {
    ledger: engine.executionDebt.getLedger(),
    debtScore: engine.executionDebt.computeDebtScore(),
    getByWorkflow: (f: string) => engine.executionDebt.getByWorkflowFamily(f),
    getByCategory: (c: ExecutionDebtCategory) => engine.executionDebt.getByCategory(c),
    boardroomSection: engine.executionDebt.getBoardroomSection(),
  };
}

export function useExecutionDebtHeatmap() {
  const engine = getMetaGovernanceEngine();
  return engine.executionDebt.getHeatmap();
}

// ── Drag Index ──────────────────────────────────────────────────

export function useDragIndex(entityScope: EntityScope) {
  const engine = getMetaGovernanceEngine();
  return engine.drag.computeIndex(entityScope);
}

export function useDragRecommendations(entityScope: EntityScope) {
  const index = useDragIndex(entityScope);
  return index.recommendations;
}

// ── Readiness Score ─────────────────────────────────────────────

export function useReadinessToDelegate(input: ReadinessInput, entityScope: EntityScope) {
  const engine = getMetaGovernanceEngine();
  return engine.computeReadiness(input, entityScope);
}

export function useReadinessExplanation(input: ReadinessInput, entityScope: EntityScope) {
  const score = useReadinessToDelegate(input, entityScope);
  return { explanation: score.explanation, subscores: score.subscores, recommendedTier: score.recommendedTier };
}

// ── Delegation Registry ─────────────────────────────────────────

export function useDelegationRegistry() {
  const engine = getMetaGovernanceEngine();
  return {
    registry: engine.delegation.getRegistry(),
    getByTier: (t: DelegationTier) => engine.delegation.getByTier(t),
    getByWorkflow: (f: string) => engine.delegation.getByWorkflowFamily(f),
    boardroomSection: engine.delegation.getBoardroomSection(),
  };
}

export function useDelegationControls(delegationId: string) {
  const engine = getMetaGovernanceEngine();
  return {
    recordExecution: (success: boolean, proofId?: string) =>
      engine.delegation.recordExecution(delegationId, success, proofId),
    promote: (reason: string, proofIds: string[]) =>
      engine.delegation.promote(delegationId, reason, proofIds),
    demote: (toTier: DelegationTier, reason: string, triggerId: string) =>
      engine.delegation.demote(delegationId, toTier, reason, triggerId),
  };
}

// ── Invisible Labor ─────────────────────────────────────────────

export function useInvisibleLabor(contextId: string, contextType: "household" | "org") {
  const engine = getMetaGovernanceEngine();
  return {
    distribution: engine.invisibleLabor.computeBurdenDistribution(contextId, contextType),
    hasConsent: engine.invisibleLabor.hasConsent(contextId),
    boardroomSection: engine.invisibleLabor.getBoardroomSection(contextId, contextType),
  };
}

export function useLaborEqualization(contextId: string, contextType: "household" | "org") {
  const engine = getMetaGovernanceEngine();
  return engine.invisibleLabor.getEqualizationSuggestions(contextId, contextType);
}

// ── Founder Bottleneck ──────────────────────────────────────────

export function useFounderBottlenecks() {
  const engine = getMetaGovernanceEngine();
  return {
    active: engine.founderBottleneck.getActive(),
    totalCost: engine.founderBottleneck.getTotalCost(),
    boardroomSection: engine.founderBottleneck.getBoardroomSection(),
  };
}

export function useHandoffCandidates() {
  const engine = getMetaGovernanceEngine();
  return engine.founderBottleneck.getHandoffCandidates();
}

// ── Workspace View ──────────────────────────────────────────────

export function useWorkspaceView(viewMode: WorkspaceViewMode, userId?: string) {
  const engine = getMetaGovernanceEngine();
  return {
    filter: engine.workspaceView.getFilter(viewMode, userId),
    filterData: <T extends Record<string, unknown>>(data: T[]) =>
      engine.workspaceView.filterForView(data, viewMode, userId),
    isAuthorized: (action: string) =>
      engine.workspaceView.isActionAuthorized(action, viewMode, userId),
    pendingHandoffs: engine.workspaceView.getPendingHandoffs(viewMode),
    activeEscalations: engine.workspaceView.getActiveEscalations(viewMode),
  };
}

// ── Unified Boardroom ───────────────────────────────────────────

export function useMetaGovernanceBoardroom(entityScope: EntityScope, householdId?: string) {
  const engine = getMetaGovernanceEngine();
  return engine.getBoardroomSections(entityScope, householdId);
}
