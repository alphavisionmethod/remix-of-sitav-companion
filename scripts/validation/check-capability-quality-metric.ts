#!/usr/bin/env node
// SITA OS — Capability Quality Metric Validator
import { ViolationCollector, readJsonSafe } from "../architecture/lib/utils";
const vc = new ViolationCollector();
const metrics = readJsonSafe<any>("generated/capability-quality-metric.json");
if (!metrics) { console.error("❌ generated/capability-quality-metric.json not found"); process.exit(1); }
const capabilities = metrics.capabilities || metrics.entries || [];
const THRESHOLD = 40;
let belowThreshold = 0;
for (const cap of capabilities) {
  const score = cap.qualityScore ?? cap.score ?? 0;
  if (score < THRESHOLD) {
    belowThreshold++;
    vc.add("capability-quality-metric.json", "low-quality", `Capability "${cap.id || cap.name}" quality score ${score} < ${THRESHOLD}`, "warning");
  }
}
const avgScore = capabilities.length > 0 ? Math.round(capabilities.reduce((s: number, c: any) => s + (c.qualityScore ?? c.score ?? 0), 0) / capabilities.length) : 0;
console.log(`  📊 Average quality: ${avgScore}/100, ${belowThreshold}/${capabilities.length} below threshold`);
vc.report("check-capability-quality-metric");
vc.exitIfErrors();
