#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Canonical Import Checker
// Enforces that core-services and domain-engines import types
// from @/packages/contracts, not from @/lib/types/ or local defs
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";

interface Violation { file: string; rule: string; line: number; detail: string }
const violations: Violation[] = [];

const SCAN_DIRS = [
  "src/lib/core-services",
  "src/lib/domain-engines",
];

// Known canonical contract exports (subset for shadow detection)
const CANONICAL_NAMES = new Set([
  "TenantContext", "CorrelationContext", "EventEnvelope", "IntentEnvelope",
  "WorkflowState", "PolicyDecision", "PolicySnapshot", "TrustState", "TrustTransition",
  "BaseContract", "Timestamped", "TenantScoped", "DomainScoped", "DomainId",
  "UserRole", "PrivacyTier", "RiskTier", "ApprovalType", "ExecutionMode",
  "ExecutionStatus", "WorkflowStatus", "ApprovalStatus", "TrustFlag",
  "ReceiptType", "ConfidenceMetadata", "Lead", "CRMContact", "CRMAccount",
  "Quote", "Invoice", "OpportunityNode", "OpportunityGraphRuntime",
]);

function collectFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const files: string[] = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) files.push(...collectFiles(full));
    else if (e.name.endsWith(".ts") || e.name.endsWith(".tsx")) files.push(full);
  }
  return files;
}

for (const dir of SCAN_DIRS) {
  for (const file of collectFiles(dir)) {
    const content = fs.readFileSync(file, "utf-8");
    const rel = path.relative(process.cwd(), file);
    const lines = content.split("\n");

    lines.forEach((line, i) => {
      const ln = i + 1;

      // Rule: NON_CANONICAL_TYPE_IMPORT
      if (/from\s+["']@\/lib\/types\//.test(line)) {
        violations.push({ file: rel, rule: "NON_CANONICAL_TYPE_IMPORT", line: ln,
          detail: "Import from @/lib/types/ — use @/packages/contracts instead" });
      }

      // Rule: SCAFFOLD_DIRECT
      if (/from\s+["']@\/packages\/contracts\/_contract-scaffold/.test(line)) {
        violations.push({ file: rel, rule: "SCAFFOLD_DIRECT", line: ln,
          detail: "Direct scaffold import — use @/packages/contracts barrel" });
      }

      // Rule: READ_MODEL_IN_SERVICE
      if (/from\s+["']@\/packages\/contracts\/(runtime|projection)\//.test(line)) {
        violations.push({ file: rel, rule: "READ_MODEL_IN_SERVICE", line: ln,
          detail: "Service imports projection/read-model contract — use core contracts" });
      }

      // Rule: LOCAL_TYPE_DEFINITION (shadow check)
      const exportMatch = line.match(/export\s+(?:interface|type)\s+(\w+)/);
      if (exportMatch && CANONICAL_NAMES.has(exportMatch[1])) {
        violations.push({ file: rel, rule: "LOCAL_TYPE_DEFINITION", line: ln,
          detail: `Local '${exportMatch[1]}' shadows canonical contract — import from @/packages/contracts` });
      }
    });
  }
}

if (violations.length === 0) {
  console.log("✅ Canonical import check passed — all core-services/domain-engines use @/packages/contracts");
} else {
  console.error(`❌ ${violations.length} canonical import violation(s):\n`);
  for (const v of violations) {
    console.error(`  [${v.rule}] ${v.file}:${v.line}\n    → ${v.detail}\n`);
  }
  process.exit(1);
}
