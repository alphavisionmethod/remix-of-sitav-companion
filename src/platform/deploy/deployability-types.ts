// ═══════════════════════════════════════════════════════════════
// SITA OS — Deployability Types
// Per-surface build → sign → distribute → update → recover scoring.
// ═══════════════════════════════════════════════════════════════

import type { SurfaceId } from "@/lib/reality/feature-reality-types";

export type DeployStage = "build" | "sign" | "distribute" | "update" | "recover";

export type DeployStageState = "ready" | "partial" | "missing" | "deferred";

export interface DeployStageEvidence {
  readonly stage: DeployStage;
  readonly state: DeployStageState;
  readonly artifact: string;
  readonly notes?: string;
}

export interface DeployabilityEntry {
  readonly surface: SurfaceId;
  readonly stages: readonly DeployStageEvidence[];
}

export interface DeployabilityScore {
  readonly surface: SurfaceId;
  readonly score: number;       // 0..100
  readonly readyStages: number;
  readonly totalStages: number;
  readonly blockers: readonly string[];
}
