// ═══════════════════════════════════════════════════════════════
// SITA OS — Reality Classification Registry
// Classifies each infra doc by implementation reality tier
// ═══════════════════════════════════════════════════════════════

export type RealityTier =
  | "production-backed"      // Code exists, tested, deployed
  | "prototype"              // Code exists, partially functional
  | "simulated"              // Simulated in-browser, no real OS backing
  | "spec-only"              // Documentation only, no code
  | "partially-implemented"  // Some code, significant gaps
  | "experimental";          // Research/POC, not production-ready

export interface InfraDocClassification {
  docPath: string;
  docName: string;
  realityTier: RealityTier;
  description: string;
  relatedCodePaths: string[];
  relatedTests: string[];
  relatedAdminPages: string[];
  implementationCoverage: number; // 0-100%
  productionReady: boolean;
  notes: string;
}

export const INFRA_DOC_CLASSIFICATIONS: readonly InfraDocClassification[] = [
  {
    docPath: "infra/docs/KERNEL_ARCHITECTURE.md",
    docName: "Kernel Architecture",
    realityTier: "simulated",
    description: "Nova kernel with scheduler, memory manager, syscalls — all simulated in browser JS, no real OS kernel",
    relatedCodePaths: ["src/lib/nova-sdk/kernel/"],
    relatedTests: ["src/test/kernel/"],
    relatedAdminPages: ["admin/KernelDashboard"],
    implementationCoverage: 85,
    productionReady: false,
    notes: "Full simulated implementation. Scheduler, memory manager, and syscall system work in browser. Not a real OS kernel.",
  },
  {
    docPath: "infra/docs/FILESYSTEM_ARCHITECTURE.md",
    docName: "Filesystem Architecture",
    realityTier: "simulated",
    description: "SitaFilesystem with B-tree, journaling, CoW — simulated via IndexedDB, not a real filesystem",
    relatedCodePaths: ["src/lib/nova-sdk/kernel/fs/"],
    relatedTests: [],
    relatedAdminPages: [],
    implementationCoverage: 75,
    productionReady: false,
    notes: "Transactional file system simulated on top of IndexedDB. Atomic writes and journal replay implemented.",
  },
  {
    docPath: "infra/docs/MEMORY_ARCHITECTURE.md",
    docName: "Memory Architecture",
    realityTier: "simulated",
    description: "Page-based memory allocation with address spaces — simulated, no real MMU interaction",
    relatedCodePaths: ["src/lib/nova-sdk/kernel/memory/"],
    relatedTests: [],
    relatedAdminPages: [],
    implementationCoverage: 70,
    productionReady: false,
    notes: "4KB page allocation and address space isolation simulated in JS. Educational/experiential value.",
  },
  {
    docPath: "infra/docs/RENDERING_PIPELINE.md",
    docName: "Rendering Pipeline",
    realityTier: "simulated",
    description: "Compositor and rasterizer pipeline — simulated via React/Canvas, not a GPU compositor",
    relatedCodePaths: ["src/lib/nova-sdk/rendering/"],
    relatedTests: [],
    relatedAdminPages: ["admin/CompositorDebugPage"],
    implementationCoverage: 60,
    productionReady: false,
    notes: "Rendering pipeline concepts implemented as React component orchestration. Not a real GPU pipeline.",
  },
  {
    docPath: "infra/docs/BOOTABLE_PROTOTYPE_SPEC.md",
    docName: "Bootable Prototype",
    realityTier: "prototype",
    description: "Boot ceremony and initialization sequence — implemented as React app startup",
    relatedCodePaths: ["src/lib/nova-sdk/kernel/boot/"],
    relatedTests: [],
    relatedAdminPages: [],
    implementationCoverage: 80,
    productionReady: false,
    notes: "4-phase boot sequence implemented as app initialization. Works but is a simulation of OS boot.",
  },
  {
    docPath: "infra/docs/USERSPACE_ARCHITECTURE.md",
    docName: "Userspace Architecture",
    realityTier: "simulated",
    description: "Userspace services and process model — simulated in browser runtime",
    relatedCodePaths: ["src/lib/nova-sdk/userspace/"],
    relatedTests: [],
    relatedAdminPages: [],
    implementationCoverage: 65,
    productionReady: false,
    notes: "Service managers and process lifecycle simulated. No real process isolation.",
  },
  {
    docPath: "infra/docs/NOVA_OS_ARCHITECTURE.md",
    docName: "Nova OS Architecture",
    realityTier: "simulated",
    description: "Overall OS architecture — simulated as a web application with OS-like abstractions",
    relatedCodePaths: ["src/lib/nova-sdk/"],
    relatedTests: [],
    relatedAdminPages: [],
    implementationCoverage: 70,
    productionReady: false,
    notes: "Nova OS is an architectural metaphor implemented as a React SPA. It simulates OS behaviors for UX purposes.",
  },
  {
    docPath: "infra/docs/SECURITY_ARCHITECTURE.md",
    docName: "Security Architecture",
    realityTier: "partially-implemented",
    description: "34-module security fabric — core modules implemented, some are design-only",
    relatedCodePaths: ["src/lib/nova-sdk/kernel/security/"],
    relatedTests: [],
    relatedAdminPages: ["admin/SecurityCommandCenter", "admin/SecurityPostureBoard"],
    implementationCoverage: 50,
    productionReady: false,
    notes: "Trust zones, capability model, and IDS implemented. Formal verification and hardware-backed modules are spec-only.",
  },
  {
    docPath: "infra/docs/COMPOSITOR_RASTERIZER_SPEC.md",
    docName: "Compositor Rasterizer Spec",
    realityTier: "spec-only",
    description: "GPU compositor specification — no implementation, design document only",
    relatedCodePaths: [],
    relatedTests: [],
    relatedAdminPages: [],
    implementationCoverage: 0,
    productionReady: false,
    notes: "Specification document for a GPU-based compositor. No code implementation exists.",
  },
] as const;

/** Get classification for a specific doc */
export function getDocClassification(docPath: string): InfraDocClassification | undefined {
  return INFRA_DOC_CLASSIFICATIONS.find((d) => d.docPath === docPath);
}

/** Get all docs by reality tier */
export function getDocsByTier(tier: RealityTier): InfraDocClassification[] {
  return INFRA_DOC_CLASSIFICATIONS.filter((d) => d.realityTier === tier);
}

/** Get overall implementation coverage */
export function getOverallInfraCoverage(): { avgCoverage: number; productionReady: number; total: number } {
  const total = INFRA_DOC_CLASSIFICATIONS.length;
  const avgCoverage = Math.round(INFRA_DOC_CLASSIFICATIONS.reduce((s, d) => s + d.implementationCoverage, 0) / total);
  const productionReady = INFRA_DOC_CLASSIFICATIONS.filter((d) => d.productionReady).length;
  return { avgCoverage, productionReady, total };
}
