#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin Top-Level Domain Count Check
// Ensures admin domains stay within governance budget
// ═══════════════════════════════════════════════════════════════

import { ViolationCollector } from "../lib/utils";
import * as fs from "fs";

const vc = new ViolationCollector();
const MAX_DOMAINS = 12;

const navPath = "src/components/admin/shells/AdminPrimaryNav.tsx";
if (!fs.existsSync(navPath)) {
  vc.add(navPath, "missing-nav", "Admin primary nav not found — cannot count domains", "warning");
} else {
  const content = fs.readFileSync(navPath, "utf-8");
  // Count navigation items that represent top-level domains
  const domainMatches = content.match(/label:\s*["'][^"']+["']/g) || [];
  console.log(`  🏷️ ${domainMatches.length} top-level admin domains`);

  if (domainMatches.length > MAX_DOMAINS) {
    vc.add(navPath, "domain-sprawl", `${domainMatches.length} admin domains exceeds budget of ${MAX_DOMAINS}`);
  }
}

vc.report("check-admin-top-level-domain-count");
vc.exitIfErrors();
