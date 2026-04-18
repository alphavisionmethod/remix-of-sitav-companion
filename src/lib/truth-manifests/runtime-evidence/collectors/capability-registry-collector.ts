// ═══════════════════════════════════════════════════════════════
// Capability Registry Collector
// Reads live capability registry to enumerate handlers.
// ═══════════════════════════════════════════════════════════════

import { makeRecord, safeGet } from "./_helpers";
import type { RuntimeEvidenceRecord } from "../runtime-evidence-types";

function readCapabilityIds(): string[] {
  // Lazy import to avoid hard coupling at module init time.
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require("@/lib/capabilities/capability-registry") as {
      listCapabilities?: () => string[];
    };
    return safeGet(() => mod.listCapabilities?.() ?? [], []);
  } catch {
    return [];
  }
}

export function collectCapabilityRegistryEvidence(): RuntimeEvidenceRecord {
  const ids = readCapabilityIds();
  const warnings: string[] = [];
  if (ids.length === 0) {
    warnings.push("Capability registry exposes no handlers — registrations may not have run");
  }
  return makeRecord(
    "collector.capability-registry",
    "manifest-capability-index",
    {
      capabilityIds: ids,
      domains: Array.from(new Set(ids.map((id) => id.split(".")[0]))),
    },
    { itemCount: ids.length, warnings },
  );
}
