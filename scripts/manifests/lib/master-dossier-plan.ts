// SITA OS — Master Dossier Expansion Plan Logic
export interface DossierSection {
  id: string;
  name: string;
  status: "planned" | "in-progress" | "complete";
  requiredArtifacts: string[];
}

export const DOSSIER_PLAN: DossierSection[] = [
  { id: "architecture", name: "Architecture Overview", status: "complete", requiredArtifacts: ["generated/service-manifest.json", "generated/route-manifest.json"] },
  { id: "capabilities", name: "Capability Registry", status: "complete", requiredArtifacts: ["generated/capability-index.json", "generated/capability-family-index.json"] },
  { id: "contracts", name: "Contract Surface", status: "complete", requiredArtifacts: ["generated/contract-manifest.json"] },
  { id: "compliance", name: "Compliance & Security", status: "complete", requiredArtifacts: ["generated/architecture-compliance-report.json", "generated/security-review-manifest.json"] },
  { id: "operations", name: "Operational Readiness", status: "complete", requiredArtifacts: ["generated/operational-scorecards.json", "generated/runtime-conformance-manifest.json"] },
  { id: "launch", name: "Launch Readiness", status: "complete", requiredArtifacts: ["generated/launch-tier-index.json", "generated/maturity-thresholds.json"] },
  { id: "kernel", name: "Kernel Architecture", status: "complete", requiredArtifacts: ["generated/kernel-architecture-manifest.json", "generated/syscall-manifest.json"] },
  { id: "boot", name: "Boot Chain & First Boot", status: "complete", requiredArtifacts: ["generated/boot-chain-manifest.json", "generated/first-boot-contract-manifest.json", "generated/first-boot-proof-receipts.json"] },
  { id: "rendering", name: "Rendering Pipeline", status: "complete", requiredArtifacts: ["generated/rendering-pipeline-manifest.json"] },
  { id: "security-model", name: "Security Model", status: "complete", requiredArtifacts: ["generated/security-model-manifest.json"] },
  { id: "accessibility", name: "Accessibility", status: "complete", requiredArtifacts: ["generated/accessibility-summary.json"] },
  { id: "vmware", name: "VMware Deployment", status: "complete", requiredArtifacts: ["generated/base-os-manifest.json", "generated/userspace-services-manifest.json"] },
];

export function getDossierProgress(): { total: number; complete: number; percent: number } {
  const complete = DOSSIER_PLAN.filter(s => s.status === "complete").length;
  return { total: DOSSIER_PLAN.length, complete, percent: Math.round((complete / DOSSIER_PLAN.length) * 100) };
}
