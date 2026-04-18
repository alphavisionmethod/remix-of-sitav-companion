// ═══════════════════════════════════════════════════════════════
// Userspace Services Collector
// Lists userspace services currently exposed via window globals.
// ═══════════════════════════════════════════════════════════════

import { makeRecord, safeGet } from "./_helpers";
import type { RuntimeEvidenceRecord } from "../runtime-evidence-types";

const USERSPACE_SERVICES = [
  "FileSystemService",
  "WindowServer",
  "InputService",
  "NotificationService",
  "SettingsService",
  "PluginRegistry",
  "WidgetRegistry",
  "IntegrationRegistry",
] as const;

export function collectUserspaceServicesEvidence(): RuntimeEvidenceRecord {
  const w = (typeof window !== "undefined" ? window : {}) as Record<string, unknown>;
  const services = USERSPACE_SERVICES.map((name) => ({
    name,
    available: safeGet(() => w[name] != null, false),
  }));
  const present = services.filter((s) => s.available);
  return makeRecord(
    "collector.userspace-services",
    "manifest-userspace-services",
    { services, presentCount: present.length },
    { itemCount: present.length },
  );
}
