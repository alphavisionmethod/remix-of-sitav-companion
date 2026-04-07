// ═══════════════════════════════════════════════════════════════
// SITA OS — Meta-Governance Engine (Facade)
// Unified API over all 8 sub-engines. No duplicated logic.
// All scoring, detection, and analysis routes through here.
// ═══════════════════════════════════════════════════════════════

import { TrustDebtEngine } from "./trust-debt-engine";
import { ExecutionDebtEngine } from "./execution-debt-engine";
import { DragEngine } from "./drag-engine";
import { ReadinessEngine } from "./readiness-engine";
import type { ReadinessInput } from "./readiness-engine";
import { InvisibleLaborEngine } from "./invisible-labor-engine";
import { FounderBottleneckEngine } from "./founder-bottleneck-engine";
import { DelegationEngine } from "./delegation-engine";
import { WorkspaceViewEngine } from "./workspace-view-engine";
import type { GovernanceBoardroomSection } from "../types/meta-governance.types";
import type { EntityScope, ActionRecord, ProofRecord } from "../types/os-unified.types";

export class MetaGovernanceEngine {
  readonly trustDebt: TrustDebtEngine;
  readonly executionDebt: ExecutionDebtEngine;
  readonly drag: DragEngine;
  readonly readiness: ReadinessEngine;
  readonly invisibleLabor: InvisibleLaborEngine;
  readonly founderBottleneck: FounderBottleneckEngine;
  readonly delegation: DelegationEngine;
  readonly workspaceView: WorkspaceViewEngine;

  constructor() {
    this.trustDebt = new TrustDebtEngine();
    this.executionDebt = new ExecutionDebtEngine();
    this.drag = new DragEngine();
    this.readiness = new ReadinessEngine();
    this.invisibleLabor = new InvisibleLaborEngine();
    this.founderBottleneck = new FounderBottleneckEngine();
    this.delegation = new DelegationEngine();
    this.workspaceView = new WorkspaceViewEngine();
  }

  /** Run full analysis pipeline on a set of action records */
  analyzeActions(actions: ActionRecord[], proofRecords: ProofRecord[]): {
    trustDebts: ReturnType<TrustDebtEngine["detectFromAction"]>[];
    executionDebts: ReturnType<ExecutionDebtEngine["detectFromActions"]>;
  } {
    const trustDebts = actions.map(a => this.trustDebt.detectFromAction(a, proofRecords)).filter(Boolean);
    const executionDebts = this.executionDebt.detectFromActions(actions);
    return { trustDebts, executionDebts };
  }

  /** Compute readiness with debt engines already wired */
  computeReadiness(input: ReadinessInput, entityScope: EntityScope): ReturnType<ReadinessEngine["compute"]> {
    return this.readiness.compute(input, this.trustDebt, this.executionDebt, entityScope);
  }

  /** Get all boardroom sections from all 8 systems */
  getBoardroomSections(entityScope: EntityScope, householdId?: string): GovernanceBoardroomSection[] {
    const sections: GovernanceBoardroomSection[] = [
      this.trustDebt.getBoardroomSection(),
      this.executionDebt.getBoardroomSection(),
      this.drag.getBoardroomSection(entityScope),
      this.founderBottleneck.getBoardroomSection(),
      this.delegation.getBoardroomSection(),
      this.workspaceView.getBoardroomSection(),
    ];

    if (householdId) {
      sections.push(this.invisibleLabor.getBoardroomSection(householdId, "household"));
    }

    return sections;
  }

  /** Refresh all aging across all debt engines */
  refreshAging(): void {
    this.trustDebt.refreshAging();
    this.executionDebt.refreshAging();
    this.founderBottleneck.refreshAging();
  }
}

// ── Singleton ───────────────────────────────────────────────────

let instance: MetaGovernanceEngine | null = null;

export function getMetaGovernanceEngine(): MetaGovernanceEngine {
  if (!instance) instance = new MetaGovernanceEngine();
  return instance;
}

export function createMetaGovernanceEngine(): MetaGovernanceEngine {
  return new MetaGovernanceEngine();
}

