#!/usr/bin/env node
/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// SITA OS — Phase 1: Consolidate byte-identical duplicate services
// Reads the duplicate fingerprint report from Wave 0 and:
//   1. Confirms each pair is byte-identical (cmp).
//   2. Picks the core-services/ path as canonical (it's the
//      documented authority layer per service-constitution memory).
//   3. Replaces the services/ counterpart with a thin wrapper.
//   4. Logs the operation for the remediation report.
// ═══════════════════════════════════════════════════════════════

import { readFileSync, writeFileSync, statSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";

interface DupGroup {
  fingerprint: string;
  files: string[];
}

const REPORT = "generated/lib-decomposition/SRC_LIB_DUPLICATE_AND_AMBIGUOUS_MODULES.md";
const md = readFileSync(REPORT, "utf8");

const groups: DupGroup[] = [];
const re = /### Fingerprint `([^`]+)`\n((?:- `[^`]+`\n)+)/g;
let m: RegExpExecArray | null;
while ((m = re.exec(md)) !== null) {
  const files = [...m[2].matchAll(/- `([^`]+)`/g)].map(x => x[1]);
  groups.push({ fingerprint: m[1], files });
}

console.log(`Found ${groups.length} duplicate fingerprint groups`);

interface ConsolidationRecord {
  fingerprint: string;
  canonical: string;
  retired: string;
  byteIdentical: boolean;
  action: string;
}

const records: ConsolidationRecord[] = [];

for (const g of groups) {
  if (g.files.length !== 2) {
    console.log(`  ⚠ skip fp=${g.fingerprint}: ${g.files.length} files`);
    continue;
  }
  const [a, b] = g.files;
  let canonical = a, retired = b;
  if (b.includes("/core-services/")) { canonical = b; retired = a; }
  else if (a.includes("/core-services/")) { canonical = a; retired = b; }

  let identical = false;
  try {
    const ha = createHash("sha256").update(readFileSync(canonical)).digest("hex");
    const hb = createHash("sha256").update(readFileSync(retired)).digest("hex");
    identical = ha === hb;
  } catch (e) {
    console.log(`  ✗ skip ${canonical}: ${(e as Error).message}`);
    continue;
  }

  if (!identical) {
    records.push({ fingerprint: g.fingerprint, canonical, retired, byteIdentical: false, action: "skipped-divergent" });
    continue;
  }

  // Compute import path from retired -> canonical
  const canonicalImport = "@/" + canonical.replace(/^src\//, "").replace(/\.(ts|tsx)$/, "");
  const wrapper = `// @lovable:migrated-wrapper\n/**\n * @deprecated Consolidated to ${canonicalImport} (Wave 4 remediation).\n * This wrapper exists for back-compat and will be removed once all consumers migrate.\n */\nexport * from "${canonicalImport}";\n`;
  writeFileSync(retired, wrapper);
  records.push({ fingerprint: g.fingerprint, canonical, retired, byteIdentical: true, action: "wrapped" });
  console.log(`  ✓ ${retired} → ${canonicalImport}`);
}

mkdirSync("generated/lib-remediation", { recursive: true });
writeFileSync(
  "generated/lib-remediation/duplicate-resolution.json",
  JSON.stringify({ generatedAt: new Date().toISOString(), groups: groups.length, processed: records.length, records }, null, 2),
);
console.log(`\n✓ Consolidated ${records.filter(r => r.action === "wrapped").length} duplicate(s)`);
