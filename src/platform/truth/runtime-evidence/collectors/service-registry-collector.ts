// ═══════════════════════════════════════════════════════════════
// Service Registry Collector
// Inspects ServiceManager for actually registered services.
// ═══════════════════════════════════════════════════════════════

import { makeRecord, safeGet } from "./_helpers";
import type { RuntimeEvidenceRecord } from "../runtime-evidence-types";

interface ServiceEntryShape {
  id?: string;
  name?: string;
  status?: string;
}

function readServices(): ServiceEntryShape[] {
  if (typeof window === "undefined") return [];
  const sm = (window as unknown as { ServiceManager?: { listServices?: () => ServiceEntryShape[] } }).ServiceManager;
  return safeGet(() => sm?.listServices?.() ?? [], []);
}

export function collectServiceRegistryEvidence(): RuntimeEvidenceRecord {
  const services = readServices();
  const warnings: string[] = [];
  if (services.length === 0) {
    warnings.push("ServiceManager has no registered services in this runtime");
  }
  return makeRecord(
    "collector.service-registry",
    "manifest-userspace-services",
    {
      services: services.map((s) => ({
        id: s.id ?? s.name,
        name: s.name,
        status: s.status,
      })),
    },
    { itemCount: services.length, warnings },
  );
}
