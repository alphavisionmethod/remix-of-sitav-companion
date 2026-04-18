import type { SupervisorDefinition } from "./types";

export const SUPERVISORS: SupervisorDefinition[] = [
  {
    supervisorId: "chief-of-staff", name: "Chief of Staff", council: "all",
    maxConcurrentEscalations: 10, canOverride: true, canSuspend: true,
    responsibilities: ["Coordinate across councils", "Prioritize incidents vs. roadmap tasks", "Trigger cross-council escalations", "Request human intervention when needed", "Resolve inter-council conflicts"],
  },
  {
    supervisorId: "sup-product", name: "Product Supervisor", council: "product-build",
    maxConcurrentEscalations: 5, canOverride: true, canSuspend: true,
    responsibilities: ["Load balancing within council", "Escalation routing", "Output quality and consistency", "Conflict resolution", "Autonomy limit enforcement"],
  },
  {
    supervisorId: "sup-reliability", name: "Reliability Supervisor", council: "reliability-ops",
    maxConcurrentEscalations: 8, canOverride: true, canSuspend: true,
    responsibilities: ["Incident prioritization", "Escalation routing to agents and chief-of-staff", "SLO compliance monitoring", "Release gate enforcement", "Agent cooldown management"],
  },
  {
    supervisorId: "sup-security", name: "Security Supervisor", council: "security-trust",
    maxConcurrentEscalations: 5, canOverride: true, canSuspend: true,
    responsibilities: ["Threat assessment coordination", "Permission drift triage", "Audit completeness oversight", "Trust threshold enforcement", "Privacy boundary compliance"],
  },
  {
    supervisorId: "sup-runtime", name: "Runtime Supervisor", council: "runtime-cost",
    maxConcurrentEscalations: 4, canOverride: true, canSuspend: false,
    responsibilities: ["Budget enforcement", "Model routing optimization", "Latency monitoring", "Capacity planning review", "Cost anomaly triage"],
  },
  {
    supervisorId: "sup-architecture", name: "Architecture Supervisor", council: "architecture-governance",
    maxConcurrentEscalations: 4, canOverride: true, canSuspend: true,
    responsibilities: ["Architecture invariant enforcement", "Registry truth validation", "Contract integrity oversight", "Change control compliance", "Boundary enforcement"],
  },
  {
    supervisorId: "sup-knowledge", name: "Knowledge Supervisor", council: "knowledge-coordination",
    maxConcurrentEscalations: 3, canOverride: false, canSuspend: false,
    responsibilities: ["Knowledge quality assurance", "Release notes accuracy", "Sprint planning support", "Cross-team dependency tracking", "Drift detection coordination"],
  },
];

export function getSupervisor(id: string) {
  return SUPERVISORS.find(s => s.supervisorId === id);
}
