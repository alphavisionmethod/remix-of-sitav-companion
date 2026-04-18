// ═══════════════════════════════════════════════════════════════
// SITA OS — Runtime Probes (Phase 29)
// Real callable probe functions backing Golden Path verifications.
// Each probe returns a ProbeResult that the runtime evaluator and
// admin surfaces consume to certify a path is healthy in production.
// ═══════════════════════════════════════════════════════════════

export type ProbeStatus = "pass" | "fail" | "skip";

export interface ProbeResult {
  readonly probeId: string;
  readonly pathId: string;
  readonly status: ProbeStatus;
  readonly latencyMs: number;
  readonly checkedAt: string;
  readonly details: Readonly<Record<string, unknown>>;
  readonly error?: string;
}

export type ProbeFn = () => Promise<ProbeResult>;

export interface ProbeDescriptor {
  readonly probeId: string;
  readonly pathId: string;
  readonly title: string;
  readonly run: ProbeFn;
}

export { firstBootProbe } from "./first-boot-probe";
export { oauthSyncProbe } from "./oauth-sync-probe";
export { restoreProbe } from "./restore-probe";
export { mobileApprovalProbe } from "./mobile-approval-probe";
export { workflowReplayProbe } from "./workflow-replay-probe";
export { envRecoveryProbe } from "./env-recovery-probe";
export { pushPipelineProbe } from "./push-pipeline-probe";

import { firstBootProbe } from "./first-boot-probe";
import { oauthSyncProbe } from "./oauth-sync-probe";
import { restoreProbe } from "./restore-probe";
import { mobileApprovalProbe } from "./mobile-approval-probe";
import { workflowReplayProbe } from "./workflow-replay-probe";
import { envRecoveryProbe } from "./env-recovery-probe";
import { pushPipelineProbe } from "./push-pipeline-probe";

export const RUNTIME_PROBES: readonly ProbeDescriptor[] = [
  firstBootProbe,
  oauthSyncProbe,
  restoreProbe,
  mobileApprovalProbe,
  workflowReplayProbe,
  envRecoveryProbe,
  pushPipelineProbe,
];

export function getProbe(probeId: string): ProbeDescriptor | undefined {
  return RUNTIME_PROBES.find((p) => p.probeId === probeId);
}

export function getProbesForPath(pathId: string): readonly ProbeDescriptor[] {
  return RUNTIME_PROBES.filter((p) => p.pathId === pathId);
}
