// ═══════════════════════════════════════════════════════════════
// SITA OS — Kill Switch Dependency Map
// Declarative graph of switch-to-switch relationships:
//  • depends-on  : activating A is meaningful only if B is also active
//  • supersedes  : A subsumes B (no need to flip B separately)
//  • co-activates: A and B should generally be flipped together
// Used by the operator UI to recommend cascading actions.
// ═══════════════════════════════════════════════════════════════

import type { SwitchDependencyEdge } from "./kill-switch-types";

export const KILL_SWITCH_DEPENDENCY_MAP: readonly SwitchDependencyEdge[] = [
  {
    fromSwitchId: "KS-MODEL-PROVIDERS",
    toSwitchId: "KS-ADVISORS",
    relation: "co-activates",
    rationale:
      "Disabling AI providers makes advisor recommendations impossible — flipping advisors avoids confusing partial state.",
  },
  {
    fromSwitchId: "KS-MODEL-PROVIDERS",
    toSwitchId: "KS-WORKFLOW",
    relation: "co-activates",
    rationale: "Most workflow steps depend on AI; halt them rather than fail loudly.",
  },
  {
    fromSwitchId: "KS-CONNECTORS",
    toSwitchId: "KS-SYNC",
    relation: "supersedes",
    rationale: "If all connectors are down, sync cannot run — KS-CONNECTORS implies KS-SYNC.",
  },
  {
    fromSwitchId: "KS-CONNECTORS",
    toSwitchId: "KS-PROVIDER-INGESTION",
    relation: "co-activates",
    rationale:
      "Outbound connector calls and inbound provider ingestion typically share token / health state.",
  },
  {
    fromSwitchId: "KS-WORKFLOW",
    toSwitchId: "KS-AUTOMATIONS",
    relation: "co-activates",
    rationale: "Automations are workflow triggers; pausing workflows makes automations no-ops.",
  },
  {
    fromSwitchId: "KS-PAYMENTS",
    toSwitchId: "KS-OUTBOUND",
    relation: "depends-on",
    rationale:
      "If outbound comms are halted, payment failure receipts cannot be delivered — operators should consider both together.",
  },
  {
    fromSwitchId: "KS-RELEASE-ROLLOUT",
    toSwitchId: "KS-APPLIANCE-UPDATE",
    relation: "co-activates",
    rationale:
      "Halting web release rollout while letting appliance OTA push a new image creates split-brain installs.",
  },
  {
    fromSwitchId: "KS-SELF-HEALING",
    toSwitchId: "KS-WORKFLOW",
    relation: "depends-on",
    rationale: "Self-healing repairs typically restart workflow services; pausing healing is risky if workflows are also paused.",
  },
] as const;

export function getDependenciesOf(switchId: string): readonly SwitchDependencyEdge[] {
  return KILL_SWITCH_DEPENDENCY_MAP.filter((e) => e.fromSwitchId === switchId);
}

export function getDependentsOn(switchId: string): readonly SwitchDependencyEdge[] {
  return KILL_SWITCH_DEPENDENCY_MAP.filter((e) => e.toSwitchId === switchId);
}

/** Recommend the full set of switches to consider when activating one. */
export function recommendCascade(switchId: string): readonly string[] {
  const out = new Set<string>([switchId]);
  for (const edge of KILL_SWITCH_DEPENDENCY_MAP) {
    if (edge.fromSwitchId === switchId && edge.relation !== "supersedes") {
      out.add(edge.toSwitchId);
    }
  }
  return Array.from(out);
}
