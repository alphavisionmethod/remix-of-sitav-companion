// ═══════════════════════════════════════════════════════════════
// SITA OS — Infra Implementation Coverage Map
// Which code actually backs each infra doc claim
// ═══════════════════════════════════════════════════════════════

import { INFRA_DOC_CLASSIFICATIONS } from "./reality-classification-registry";

export interface CoverageEntry {
  docPath: string;
  docName: string;
  claims: CoverageClaim[];
  overallCoverage: number;
}

export interface CoverageClaim {
  claim: string;
  codeEvidence: string[];
  testEvidence: string[];
  status: "implemented" | "partial" | "missing";
}

/** Implementation coverage for each major infra doc */
export const INFRA_COVERAGE_MAP: readonly CoverageEntry[] = [
  {
    docPath: "infra/docs/KERNEL_ARCHITECTURE.md",
    docName: "Kernel Architecture",
    overallCoverage: 85,
    claims: [
      { claim: "Preemptive MLFQ scheduler", codeEvidence: ["src/lib/nova-sdk/kernel/scheduler/"], testEvidence: [], status: "implemented" },
      { claim: "Page-based memory manager", codeEvidence: ["src/lib/nova-sdk/kernel/memory/"], testEvidence: [], status: "implemented" },
      { claim: "Syscall dispatch (jump table)", codeEvidence: ["src/lib/nova-sdk/kernel/syscalls/"], testEvidence: [], status: "implemented" },
      { claim: "HAL driver manager", codeEvidence: ["src/lib/nova-sdk/kernel/hal/"], testEvidence: [], status: "implemented" },
      { claim: "Hardware interrupt handling", codeEvidence: [], testEvidence: [], status: "missing" },
    ],
  },
  {
    docPath: "infra/docs/FILESYSTEM_ARCHITECTURE.md",
    docName: "Filesystem Architecture",
    overallCoverage: 75,
    claims: [
      { claim: "B-tree indexed filesystem", codeEvidence: ["src/lib/nova-sdk/kernel/fs/"], testEvidence: [], status: "implemented" },
      { claim: "Atomic writes (CoW)", codeEvidence: ["src/lib/nova-sdk/kernel/fs/"], testEvidence: [], status: "implemented" },
      { claim: "Journal replay on boot", codeEvidence: ["src/lib/nova-sdk/kernel/fs/"], testEvidence: [], status: "implemented" },
      { claim: "Real disk persistence", codeEvidence: [], testEvidence: [], status: "missing" },
    ],
  },
  {
    docPath: "infra/docs/SECURITY_ARCHITECTURE.md",
    docName: "Security Architecture",
    overallCoverage: 50,
    claims: [
      { claim: "7 trust zones (A-G)", codeEvidence: ["src/lib/nova-sdk/kernel/security/"], testEvidence: [], status: "implemented" },
      { claim: "Capability-based security", codeEvidence: ["src/lib/nova-sdk/kernel/security/"], testEvidence: [], status: "implemented" },
      { claim: "Intrusion Detection System", codeEvidence: ["src/lib/nova-sdk/kernel/security/"], testEvidence: [], status: "partial" },
      { claim: "Hardware-backed attestation", codeEvidence: [], testEvidence: [], status: "missing" },
      { claim: "Formal verification", codeEvidence: [], testEvidence: [], status: "missing" },
    ],
  },
  {
    docPath: "infra/docs/BOOTABLE_PROTOTYPE_SPEC.md",
    docName: "Bootable Prototype",
    overallCoverage: 80,
    claims: [
      { claim: "4-phase boot sequence", codeEvidence: ["src/lib/nova-sdk/kernel/boot/"], testEvidence: [], status: "implemented" },
      { claim: "HAL initialization", codeEvidence: ["src/lib/nova-sdk/kernel/hal/"], testEvidence: [], status: "implemented" },
      { claim: "Service startup ordering", codeEvidence: ["src/lib/nova-sdk/kernel/boot/"], testEvidence: [], status: "implemented" },
      { claim: "Boot from physical media", codeEvidence: [], testEvidence: [], status: "missing" },
    ],
  },
  {
    docPath: "infra/docs/RENDERING_PIPELINE.md",
    docName: "Rendering Pipeline",
    overallCoverage: 60,
    claims: [
      { claim: "Compositor layer management", codeEvidence: ["src/lib/nova-sdk/rendering/"], testEvidence: [], status: "partial" },
      { claim: "GPU rasterization", codeEvidence: [], testEvidence: [], status: "missing" },
      { claim: "Window composition", codeEvidence: ["src/components/sita/"], testEvidence: [], status: "implemented" },
    ],
  },
];

/** Get coverage for a specific doc */
export function getDocCoverage(docPath: string): CoverageEntry | undefined {
  return INFRA_COVERAGE_MAP.find((c) => c.docPath === docPath);
}

/** Get all claims with missing implementation */
export function getMissingClaims(): Array<{ docName: string; claim: string }> {
  const missing: Array<{ docName: string; claim: string }> = [];
  for (const entry of INFRA_COVERAGE_MAP) {
    for (const claim of entry.claims) {
      if (claim.status === "missing") {
        missing.push({ docName: entry.docName, claim: claim.claim });
      }
    }
  }
  return missing;
}

/** Get aggregate stats */
export function getInfraCoverageStats(): { totalClaims: number; implemented: number; partial: number; missing: number } {
  let implemented = 0, partial = 0, missing = 0;
  for (const entry of INFRA_COVERAGE_MAP) {
    for (const claim of entry.claims) {
      if (claim.status === "implemented") implemented++;
      else if (claim.status === "partial") partial++;
      else missing++;
    }
  }
  return { totalClaims: implemented + partial + missing, implemented, partial, missing };
}
