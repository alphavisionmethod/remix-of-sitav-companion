import type { CouncilDefinition } from "./types";

export const COUNCILS: CouncilDefinition[] = [
  { councilId: "product-build", name: "Product & Build", purpose: "Product quality, UX consistency, documentation, and build health", agentCount: 8, supervisorId: "sup-product", quorum: 50, vetoAuthority: true },
  { councilId: "reliability-ops", name: "Reliability & Ops", purpose: "Uptime, incident response, recovery, fleet health, and release safety", agentCount: 8, supervisorId: "sup-reliability", quorum: 50, vetoAuthority: true },
  { councilId: "security-trust", name: "Security & Trust", purpose: "Security posture, permission integrity, policy review, and trust thresholds", agentCount: 7, supervisorId: "sup-security", quorum: 60, vetoAuthority: true },
  { councilId: "runtime-cost", name: "Runtime & Cost", purpose: "Token budgets, AI spend, model routing, latency, and capacity", agentCount: 6, supervisorId: "sup-runtime", quorum: 50, vetoAuthority: false },
  { councilId: "architecture-governance", name: "Architecture & Governance", purpose: "Architecture consistency, registry truth, contract integrity, and change control", agentCount: 6, supervisorId: "sup-architecture", quorum: 60, vetoAuthority: true },
  { councilId: "knowledge-coordination", name: "Knowledge & Coordination", purpose: "Knowledge curation, release notes, planning, TPM, and drift detection", agentCount: 5, supervisorId: "sup-knowledge", quorum: 50, vetoAuthority: false },
];

export function getCouncil(councilId: string) {
  return COUNCILS.find(c => c.councilId === councilId);
}
