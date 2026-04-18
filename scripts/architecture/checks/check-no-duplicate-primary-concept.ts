#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — No Duplicate Primary Concept (Phase 3)
// Asserts that exactly one PRIMARY_DOMAIN_ENTRY exists per
// canonical admin domain. Prevents regression where multiple
// pages compete to be the executive landing for the same domain.
// ═══════════════════════════════════════════════════════════════

import { ViolationCollector } from "../lib/utils";
import {
  ADMIN_DOMAINS,
  ADMIN_ROUTE_REGISTRY,
} from "../../../src/platform/architecture/admin-route-registry";

const vc = new ViolationCollector();

const primaryByDomain: Record<string, string[]> = {};
for (const r of ADMIN_ROUTE_REGISTRY) {
  if (r.pageClass === "PRIMARY_DOMAIN_ENTRY") {
    (primaryByDomain[r.domain] ||= []).push(r.path);
  }
}

for (const d of ADMIN_DOMAINS) {
  const hubs = primaryByDomain[d] ?? [];
  if (hubs.length === 0) {
    vc.add(
      "src/platform/architecture/admin-route-registry.ts",
      "missing-primary",
      `Domain "${d}" has no PRIMARY_DOMAIN_ENTRY`,
    );
  } else if (hubs.length > 1) {
    vc.add(
      "src/platform/architecture/admin-route-registry.ts",
      "duplicate-primary",
      `Domain "${d}" has ${hubs.length} primary entries: ${hubs.join(", ")} — exactly one is allowed`,
    );
  } else {
    console.log(`  ✅ ${d.padEnd(16)} → ${hubs[0]}`);
  }
}

vc.report("check-no-duplicate-primary-concept");
vc.exitIfErrors();
