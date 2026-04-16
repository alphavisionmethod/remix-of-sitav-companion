#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — No Duplicate Primary Concept (Phase 3)
// Asserts that exactly one PRIMARY_DOMAIN_ENTRY exists per
// canonical admin domain. Prevents regression where multiple
// pages compete to be the executive landing for the same domain.
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";
import { ViolationCollector } from "../lib/utils";

const vc = new ViolationCollector();
const registryPath = "src/lib/architecture/admin-route-registry.ts";

if (!fs.existsSync(registryPath)) {
  vc.add(registryPath, "missing-registry", "admin-route-registry.ts not found");
} else {
  const src = fs.readFileSync(registryPath, "utf-8");

  // Cheap parse: count PRIMARY_DOMAIN_ENTRY per domain by scanning
  // entries between path: "..." and the next entry boundary.
  const entryRegex =
    /path:\s*"([^"]+)"[^}]*?domain:\s*"([^"]+)"[^}]*?pageClass:\s*"([^"]+)"/gs;

  const primaryByDomain: Record<string, string[]> = {};
  let m: RegExpExecArray | null;
  while ((m = entryRegex.exec(src)) !== null) {
    const [, p, domain, klass] = m;
    if (klass === "PRIMARY_DOMAIN_ENTRY") {
      (primaryByDomain[domain] ||= []).push(p);
    }
  }

  const expectedDomains = [
    "overview", "alerts", "approvals", "environments",
    "ai-runtime", "integrations", "trust-security", "health",
    "releases", "verification", "config", "support",
  ];

  for (const d of expectedDomains) {
    const hubs = primaryByDomain[d] ?? [];
    if (hubs.length === 0) {
      vc.add(registryPath, "missing-primary", `Domain "${d}" has no PRIMARY_DOMAIN_ENTRY`);
    } else if (hubs.length > 1) {
      vc.add(
        registryPath,
        "duplicate-primary",
        `Domain "${d}" has ${hubs.length} primary entries: ${hubs.join(", ")} — exactly one is allowed`,
      );
    } else {
      console.log(`  ✅ ${d.padEnd(16)} → ${hubs[0]}`);
    }
  }
}

vc.report("check-no-duplicate-primary-concept");
vc.exitIfErrors();
