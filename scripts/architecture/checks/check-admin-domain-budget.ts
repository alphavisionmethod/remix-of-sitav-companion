#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin Domain Budget Check
// Enforces the 12-domain canonical IA: no more top-level admin domains.
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import { ViolationCollector } from "../lib/utils";

const vc = new ViolationCollector();

const REGISTRY_PATH = "src/lib/architecture/admin-route-registry.ts";

if (!fs.existsSync(REGISTRY_PATH)) {
  vc.add(REGISTRY_PATH, "missing-registry", "admin-route-registry.ts not found");
  vc.report("check-admin-domain-budget");
  vc.exitIfErrors();
  process.exit(0);
}

const src = fs.readFileSync(REGISTRY_PATH, "utf-8");

// Parse ADMIN_DOMAINS const tuple.
const block = src.match(/export const ADMIN_DOMAINS\s*=\s*\[([^\]]+)\]/);
if (!block) {
  vc.add(REGISTRY_PATH, "parse-error", "ADMIN_DOMAINS export not found");
} else {
  const domains = (block[1].match(/"([^"]+)"/g) ?? []).map((s) => s.replace(/"/g, ""));
  console.log(`  📊 ${domains.length} top-level admin domains: ${domains.join(", ")}`);

  const MAX = 12;
  if (domains.length > MAX) {
    vc.add(REGISTRY_PATH, "domain-budget-exceeded", `${domains.length} domains > budget ${MAX}`);
  }
  // Detect duplicates
  const seen = new Set<string>();
  for (const d of domains) {
    if (seen.has(d)) vc.add(REGISTRY_PATH, "duplicate-domain", `Domain listed twice: ${d}`);
    seen.add(d);
  }
}

vc.report("check-admin-domain-budget");
vc.exitIfErrors();
