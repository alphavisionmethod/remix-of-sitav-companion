// ═══════════════════════════════════════════════════════════════
// SITA OS — Simulated Surface Registry
// Explicit registry of what's simulated-only in the platform
// ═══════════════════════════════════════════════════════════════

export interface SimulatedSurface {
  id: string;
  name: string;
  category: "kernel" | "filesystem" | "memory" | "rendering" | "security" | "networking" | "process";
  description: string;
  simulationTechnology: string;
  canBeMadeReal: boolean;
  productionAlternative: string | null;
}

export const SIMULATED_SURFACES: readonly SimulatedSurface[] = [
  {
    id: "sim-kernel-scheduler",
    name: "MLFQ Process Scheduler",
    category: "kernel",
    description: "Preemptive multi-level feedback queue scheduler simulated via setTimeout/requestAnimationFrame",
    simulationTechnology: "JavaScript event loop + priority queues",
    canBeMadeReal: false,
    productionAlternative: "Browser's built-in task scheduling (queueMicrotask, requestIdleCallback)",
  },
  {
    id: "sim-kernel-memory",
    name: "Page-Based Memory Manager",
    category: "memory",
    description: "4KB page allocation and address space isolation simulated in JS ArrayBuffers",
    simulationTechnology: "ArrayBuffer + DataView",
    canBeMadeReal: false,
    productionAlternative: "Browser memory management (automatic GC)",
  },
  {
    id: "sim-kernel-syscalls",
    name: "Syscall Interface",
    category: "kernel",
    description: "System call dispatch via jump table simulated as function registry",
    simulationTechnology: "Map<number, Function> dispatch",
    canBeMadeReal: false,
    productionAlternative: "Direct function calls / service layer",
  },
  {
    id: "sim-filesystem",
    name: "Transactional Filesystem",
    category: "filesystem",
    description: "B-tree indexed filesystem with journaling simulated on IndexedDB",
    simulationTechnology: "IndexedDB + in-memory B-tree",
    canBeMadeReal: false,
    productionAlternative: "IndexedDB directly or Electron fs-bridge",
  },
  {
    id: "sim-hal-drivers",
    name: "Hardware Abstraction Layer",
    category: "kernel",
    description: "Simulated drivers for Display, Input, Audio, Storage, Network, Battery",
    simulationTechnology: "Browser APIs wrapped as driver interfaces",
    canBeMadeReal: false,
    productionAlternative: "Direct browser API usage",
  },
  {
    id: "sim-compositor",
    name: "Window Compositor",
    category: "rendering",
    description: "Layer-based compositor simulated via React component z-index management",
    simulationTechnology: "React + CSS z-index + transform",
    canBeMadeReal: false,
    productionAlternative: "Browser's native rendering engine",
  },
  {
    id: "sim-process-model",
    name: "Process Lifecycle",
    category: "process",
    description: "Process states (launching, running, suspended, terminated) simulated via state machine",
    simulationTechnology: "XState / finite state machine",
    canBeMadeReal: false,
    productionAlternative: "React component lifecycle",
  },
  {
    id: "sim-boot-sequence",
    name: "Boot Sequence",
    category: "kernel",
    description: "4-phase boot (HAL → Kernel → Services → Extensions) simulated as app initialization",
    simulationTechnology: "Async initialization chain",
    canBeMadeReal: false,
    productionAlternative: "React app mounting with lazy loading",
  },
  {
    id: "sim-security-zones",
    name: "Trust Zone Enforcement",
    category: "security",
    description: "7 trust zones simulated via capability checks — no hardware TEE/TrustZone",
    simulationTechnology: "JavaScript capability map + policy engine",
    canBeMadeReal: false,
    productionAlternative: "RLS policies + JWT-based access control",
  },
  {
    id: "sim-power-management",
    name: "ACPI Power States",
    category: "kernel",
    description: "S0-S5 power states simulated — no real ACPI interaction",
    simulationTechnology: "State machine + Battery API",
    canBeMadeReal: false,
    productionAlternative: "Page Visibility API + Battery Status API",
  },
] as const;

/** Get all simulated surfaces */
export function getAllSimulatedSurfaces(): SimulatedSurface[] {
  return [...SIMULATED_SURFACES];
}

/** Get simulated surfaces by category */
export function getSimulatedByCategory(category: SimulatedSurface["category"]): SimulatedSurface[] {
  return SIMULATED_SURFACES.filter((s) => s.category === category);
}

/** Count of simulated surfaces */
export const SIMULATED_SURFACE_COUNT = SIMULATED_SURFACES.length;
