// ═══════════════════════════════════════════════════════════════
// SITA OS — Runtime Evidence Registry
//
// Central registry of runtime collectors. Each collector binds to
// exactly one runtime-class manifest and produces a live evidence
// record that proves the manifest reflects real runtime state.
//
// This registry is the single source of truth that the Phase 3
// validator (`check-runtime-manifest-has-evidence.ts`) consults
// when asserting that every `class: "runtime"` manifest entry has
// an evidence collector wired to it.
// ═══════════════════════════════════════════════════════════════

import type {
  RuntimeEvidenceBundle,
  RuntimeEvidenceCollectorRegistration,
  RuntimeEvidenceRecord,
} from "./runtime-evidence-types";
import { collectBootChainEvidence } from "./collectors/boot-chain-collector";
import { collectServiceRegistryEvidence } from "./collectors/service-registry-collector";
import { collectCapabilityRegistryEvidence } from "./collectors/capability-registry-collector";
import { collectShellSpaceEvidence } from "./collectors/shell-space-collector";
import { collectStartupOrderEvidence } from "./collectors/startup-order-collector";
import { collectRuntimeTierEvidence } from "./collectors/runtime-tier-collector";
import { collectKernelArchitectureEvidence } from "./collectors/kernel-architecture-collector";
import { collectUserspaceServicesEvidence } from "./collectors/userspace-services-collector";
import { collectSyscallEvidence } from "./collectors/syscall-collector";
import { collectRenderingPipelineEvidence } from "./collectors/rendering-pipeline-collector";
import { collectRuntimeTierGovernanceEvidence } from "./collectors/runtime-tier-governance-collector";
import { collectFeatureRuntimeTierEvidence } from "./collectors/feature-runtime-tier-collector";
import { detectActiveRuntimeTier } from "@/lib/runtime/runtime-detection";

/**
 * Canonical list of runtime evidence collectors.
 * Order is irrelevant — each collector is independent.
 */
export const RUNTIME_EVIDENCE_COLLECTORS: readonly RuntimeEvidenceCollectorRegistration[] = [
  {
    id: "collector.boot-chain",
    manifestId: "manifest-boot-chain",
    description: "Captures live kernel boot log and subsystem ordering",
    collector: collectBootChainEvidence,
  },
  {
    id: "collector.service-registry",
    manifestId: "manifest-userspace-services",
    description: "Inspects ServiceManager for actually registered services",
    collector: collectServiceRegistryEvidence,
  },
  {
    id: "collector.capability-registry",
    manifestId: "manifest-capability-index",
    description: "Reads live capability registry to enumerate registered handlers",
    collector: collectCapabilityRegistryEvidence,
  },
  {
    id: "collector.shell-space",
    manifestId: "manifest-shell-space",
    description: "Captures live shell-space registrations from window compositor",
    collector: collectShellSpaceEvidence,
  },
  {
    id: "collector.startup-order",
    manifestId: "manifest-startup-order",
    description: "Records observed startup ordering from boot log timestamps",
    collector: collectStartupOrderEvidence,
  },
  {
    id: "collector.runtime-tier",
    manifestId: "manifest-runtime-conformance",
    description: "Probes active runtime tier (web/desktop/appliance/simulated)",
    collector: collectRuntimeTierEvidence,
  },
  {
    id: "collector.kernel-architecture",
    manifestId: "manifest-kernel",
    description: "Snapshots kernel subsystem availability at runtime",
    collector: collectKernelArchitectureEvidence,
  },
  {
    id: "collector.userspace-services",
    manifestId: "manifest-userspace-services",
    description: "Lists userspace services that responded to health probe",
    collector: collectUserspaceServicesEvidence,
  },
  {
    id: "collector.syscall",
    manifestId: "manifest-syscall",
    description: "Snapshots syscall surface area available at runtime",
    collector: collectSyscallEvidence,
  },
  {
    id: "collector.rendering-pipeline",
    manifestId: "manifest-rendering-pipeline",
    description: "Captures rendering pipeline state (compositor, wayland, drivers)",
    collector: collectRenderingPipelineEvidence,
  },
  {
    id: "collector.runtime-tier-governance",
    manifestId: "manifest-runtime-tier-governance-report",
    description: "Publishes live tier-governance summary (active tier + loaded definitions)",
    collector: collectRuntimeTierGovernanceEvidence,
  },
  {
    id: "collector.feature-runtime-tier",
    manifestId: "manifest-feature-runtime-tier-registry",
    description: "Counts feature tier classifications loaded in the active runtime",
    collector: collectFeatureRuntimeTierEvidence,
  },
] as const;

/** Lookup a collector registration by its id. */
export function getCollector(id: string): RuntimeEvidenceCollectorRegistration | undefined {
  return RUNTIME_EVIDENCE_COLLECTORS.find((c) => c.id === id);
}

/** All manifest ids that have at least one collector wired to them. */
export function getManifestIdsWithEvidence(): Set<string> {
  return new Set(RUNTIME_EVIDENCE_COLLECTORS.map((c) => c.manifestId));
}

/**
 * Run every collector and assemble a bundle.
 * Errors in individual collectors do not abort the bundle — they
 * are captured in the corresponding record's `errors` array so that
 * validators can detect partial-evidence states.
 */
export async function runAllCollectors(): Promise<RuntimeEvidenceBundle> {
  const records: RuntimeEvidenceRecord[] = [];
  const tier = detectActiveRuntimeTier();

  for (const reg of RUNTIME_EVIDENCE_COLLECTORS) {
    try {
      const result = await reg.collector();
      records.push(result);
    } catch (e) {
      records.push({
        collectorId: reg.id,
        manifestId: reg.manifestId,
        capturedAt: new Date().toISOString(),
        runtimeTier: tier,
        ok: false,
        itemCount: 0,
        payload: {},
        warnings: [],
        errors: [`Collector threw: ${(e as Error).message}`],
      });
    }
  }

  const coverage: Record<string, number> = {};
  for (const r of records) {
    coverage[r.manifestId] = (coverage[r.manifestId] ?? 0) + 1;
  }

  return {
    bundleVersion: 1,
    generatedAt: new Date().toISOString(),
    runtimeTier: tier,
    records,
    coverage,
  };
}
