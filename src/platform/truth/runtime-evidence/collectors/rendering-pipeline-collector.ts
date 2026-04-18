// ═══════════════════════════════════════════════════════════════
// Rendering Pipeline Collector
// Captures rendering pipeline state (compositor, wayland, drivers).
// ═══════════════════════════════════════════════════════════════

import { makeRecord, safeGet } from "./_helpers";
import type { RuntimeEvidenceRecord } from "../runtime-evidence-types";

export function collectRenderingPipelineEvidence(): RuntimeEvidenceRecord {
  const w = (typeof window !== "undefined" ? window : {}) as Record<string, unknown>;
  const pipeline = {
    compositor: safeGet(() => w.Compositor != null, false),
    wayland: safeGet(() => w.WaylandServer != null, false),
    drivers: safeGet(() => w.DriverManager != null, false),
    windowServer: safeGet(() => w.WindowServer != null, false),
  };
  const activeStages = Object.values(pipeline).filter(Boolean).length;
  const warnings: string[] = [];
  if (activeStages === 0) {
    warnings.push("No rendering pipeline stage exposed at runtime");
  }
  return makeRecord(
    "collector.rendering-pipeline",
    "manifest-rendering-pipeline",
    { pipeline, activeStages, totalStages: Object.keys(pipeline).length },
    { itemCount: activeStages, warnings },
  );
}
