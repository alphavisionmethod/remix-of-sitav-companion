#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Runtime Manifest Evidence Coverage Check (Phase 3)
//
// Asserts that every manifest entry classified as `class: "runtime"`
// has at least one runtime evidence collector wired to it.
//
// Honest classification rule: a manifest cannot claim runtime
// authority unless a live probe backs it. Entries without an
// evidence collector must either (a) gain a collector, or (b) be
// demoted to `informational`.
//
// This check reads the registry directly (TS source) using a
// regex-based scan to avoid pulling the full app graph into a
// Node script. If the registry shape changes, update RX_ENTRY.
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";

const cwd = process.cwd();
const registryPath = path.join(cwd, "src/lib/truth-manifests/manifest-registry.ts");
const collectorsPath = path.join(cwd, "src/lib/truth-manifests/runtime-evidence/runtime-evidence-registry.ts");

function readFile(p: string): string {
  if (!fs.existsSync(p)) {
    console.error(`❌ Required file missing: ${p}`);
    process.exit(2);
  }
  return fs.readFileSync(p, "utf-8");
}

const registrySrc = readFile(registryPath);
const collectorsSrc = readFile(collectorsPath);

// Parse registry entries — capture each `{ id: "...", ... class: "runtime", ... authority: "..." }` line.
const entryRx = /\{\s*id:\s*"([^"]+)"[\s\S]*?class:\s*"([^"]+)"[\s\S]*?authority:\s*"([^"]+)"/g;
type EntryHit = { id: string; cls: string; authority: string };
const entries: EntryHit[] = [];
for (const m of registrySrc.matchAll(entryRx)) {
  entries.push({ id: m[1], cls: m[2], authority: m[3] });
}

if (entries.length === 0) {
  console.error("❌ No registry entries parsed — registry shape may have changed");
  process.exit(2);
}

// Parse collector → manifestId bindings.
const bindingRx = /manifestId:\s*"([^"]+)"/g;
const wiredManifestIds = new Set<string>();
for (const m of collectorsSrc.matchAll(bindingRx)) {
  wiredManifestIds.add(m[1]);
}

// Evaluate runtime entries.
const runtimeEntries = entries.filter((e) => e.cls === "runtime");
const missing: EntryHit[] = [];
const ok: EntryHit[] = [];

for (const e of runtimeEntries) {
  if (wiredManifestIds.has(e.id)) {
    ok.push(e);
  } else {
    // Authoritative runtime entries MUST have evidence.
    if (e.authority === "authoritative") {
      missing.push(e);
    } else {
      // Derived/informational runtime entries are warnings, not failures.
      console.warn(`  ⚠️  ${e.id} (${e.authority}): no runtime evidence collector — consider adding one or demoting to informational`);
    }
  }
}

console.log(`\n🔬 Runtime Evidence Coverage`);
console.log(`   Runtime-class entries: ${runtimeEntries.length}`);
console.log(`   Authoritative with evidence: ${ok.filter((e) => e.authority === "authoritative").length}`);
console.log(`   Authoritative WITHOUT evidence: ${missing.length}`);
console.log(`   Total collectors wired: ${wiredManifestIds.size}\n`);

if (missing.length > 0) {
  console.error(`❌ ${missing.length} authoritative runtime manifest(s) lack a runtime evidence collector:`);
  for (const e of missing) {
    console.error(`   - ${e.id}`);
  }
  console.error(`\n   Fix by either:`);
  console.error(`     1. Adding a collector in src/lib/truth-manifests/runtime-evidence/collectors/`);
  console.error(`        and registering it in runtime-evidence-registry.ts.`);
  console.error(`     2. Demoting the entry's authority to "derived" or "informational".`);
  process.exit(1);
}

console.log(`✅ Every authoritative runtime manifest has a runtime evidence collector.`);
process.exit(0);
