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
  { id: "vmware", name: "VMware Deployment", status: "in-progress", requiredArtifacts: ["generated/vmware-appliance/production/catalog.json"] },
  { id: "accessibility", name: "Accessibility", status: "planned", requiredArtifacts: ["generated/accessibility-summary.json"] },
];

export function getDossierProgress(): { total: number; complete: number; percent: number } {
  const complete = DOSSIER_PLAN.filter(s => s.status === "complete").length;
  return { total: DOSSIER_PLAN.length, complete, percent: Math.round((complete / DOSSIER_PLAN.length) * 100) };
}
