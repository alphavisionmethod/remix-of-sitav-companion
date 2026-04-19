#!/usr/bin/env node
/* eslint-disable no-console */
// Admin & Validation Closure — WARN ratchet meaningfulness
// Each WARN bucket must be transitional (trend down) OR explicitly classified.
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport } from "./_lib/emit-gate-report";

const STATUS = "generated/admin-and-validation-closure/warn-ratchet-status.json";
const issues: Array<{ severity: "error" | "warning"; area: string; message: string }> = [];

if (!existsSync(STATUS)) {
  emitGateReport({ gate: "warn-ratchet-meaningfulness", ok: false, issues: [{ severity: "error", area: "status", message: `Missing ${STATUS}` }] });
  console.error(`❌ warn-ratchet-meaningfulness: missing ${STATUS}`);
  process.exit(1);
}

const data = JSON.parse(readFileSync(STATUS, "utf-8")) as { buckets?: Array<{ gate: string; trend?: string; classification?: string; block_promotion_after?: string; block_promotion_at_count?: number }> };
const buckets = data.buckets ?? [];

const ALLOWED_CLASSIFICATIONS = new Set(["transitional", "noncritical-acknowledged", "observation-window-required"]);

for (const b of buckets) {
  const hasTrend = b.trend === "down";
  const hasClassification = b.classification && ALLOWED_CLASSIFICATIONS.has(b.classification);
  const hasPromotion = !!b.block_promotion_after || typeof b.block_promotion_at_count === "number";
  if (!hasTrend && !hasClassification && !hasPromotion) {
    issues.push({ severity: "error", area: b.gate, message: `WARN bucket has no trend/classification/promotion path` });
  }
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
emitGateReport({ gate: "warn-ratchet-meaningfulness", ok, issues, extra: { bucketCount: buckets.length } });
console.log(`${ok ? "✅" : "❌"} warn-ratchet-meaningfulness: ${buckets.length} buckets, ${issues.length} issue(s) [BLOCK]`);
process.exit(ok ? 0 : 1);
