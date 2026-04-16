#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Migration Ownership Check (HARDENED)
// Asserts every migration has identifiable bounded context.
// ═══════════════════════════════════════════════════════════════
import { ViolationCollector } from "../../architecture/lib/utils";
import * as fs from "fs";
import * as path from "path";

const vc = new ViolationCollector();
const REGISTRY_PATH = "src/lib/db/migration-registry.ts";
const MIG_DIR = "supabase/migrations";

if (!fs.existsSync(MIG_DIR)) {
  vc.add(MIG_DIR, "missing-dir", "Migrations directory not found", "error");
  vc.report("check-migration-ownership");
  vc.exitIfErrors();
  process.exit(1);
}

const migrations = fs.readdirSync(MIG_DIR).filter(f => f.endsWith(".sql"));

if (!fs.existsSync(REGISTRY_PATH)) {
  vc.add(REGISTRY_PATH, "missing", "Migration registry missing — run generator", "error");
  vc.report("check-migration-ownership");
  vc.exitIfErrors();
  process.exit(1);
}

const registryText = fs.readFileSync(REGISTRY_PATH, "utf-8");
const registered = new Set<string>();
const RE = /filename:\s*"([^"]+)"/g;
let m: RegExpExecArray | null;
while ((m = RE.exec(registryText)) !== null) registered.add(m[1]);

let missing = 0;
for (const f of migrations) {
  if (!registered.has(f)) {
    vc.add(`${MIG_DIR}/${f}`, "not-in-registry", `Migration ${f} not in migration-registry — regenerate`, "error");
    missing++;
  }
}

let phantoms = 0;
for (const r of registered) {
  if (!migrations.includes(r)) {
    vc.add(REGISTRY_PATH, "phantom-migration", `Registry references missing file ${r}`, "warning");
    phantoms++;
  }
}

const destructiveCount = (registryText.match(/destructive: true/g) || []).length;

console.log(`  📂 ${migrations.length} migration files | Registry: ${registered.size}`);
console.log(`  ⚠️  Missing from registry: ${missing} | Phantoms: ${phantoms} | Destructive: ${destructiveCount}`);

vc.report("check-migration-ownership");
vc.exitIfErrors();
