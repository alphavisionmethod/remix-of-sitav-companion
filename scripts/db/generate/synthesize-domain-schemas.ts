#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Synthesize Per-Domain SQL Files
// Reads migration-registry + migrations and writes one SQL artifact
// per bounded context to supabase/schema/<domain>.sql (read-only)
// ═══════════════════════════════════════════════════════════════
import * as fs from "fs";
import * as path from "path";

const REGISTRY_PATH = "src/lib/db/migration-registry.ts";
const MIG_DIR = "supabase/migrations";
const OUT_DIR = "supabase/schema";

if (!fs.existsSync(REGISTRY_PATH) || !fs.existsSync(MIG_DIR)) {
  console.error("❌ Required inputs missing");
  process.exit(1);
}

const registryText = fs.readFileSync(REGISTRY_PATH, "utf-8");
const entries: Array<{ filename: string; boundedContext: string }> = [];
const RE = /filename:\s*"([^"]+)"[^}]*boundedContext:\s*"([^"]+)"/g;
let m: RegExpExecArray | null;
while ((m = RE.exec(registryText)) !== null) {
  entries.push({ filename: m[1], boundedContext: m[2] });
}

const byDomain = new Map<string, string[]>();
for (const e of entries) {
  if (!byDomain.has(e.boundedContext)) byDomain.set(e.boundedContext, []);
  byDomain.get(e.boundedContext)!.push(e.filename);
}

fs.mkdirSync(OUT_DIR, { recursive: true });
let totalWritten = 0;

for (const [domain, files] of byDomain) {
  const lines: string[] = [
    `-- ═══════════════════════════════════════════════════════════════`,
    `-- SITA OS — Synthesized schema for: ${domain}`,
    `-- AUTO-GENERATED from supabase/migrations/. DO NOT EDIT.`,
    `-- Regenerate via: npx tsx scripts/db/generate/synthesize-domain-schemas.ts`,
    `-- Source migrations: ${files.length}`,
    `-- Last generated: ${new Date().toISOString()}`,
    `-- ═══════════════════════════════════════════════════════════════`,
    ``,
  ];
  for (const f of files.sort()) {
    const content = fs.readFileSync(path.join(MIG_DIR, f), "utf-8");
    lines.push(`-- ── ${f} ──`);
    lines.push(content.trim());
    lines.push("");
  }
  fs.writeFileSync(path.join(OUT_DIR, `${domain}.sql`), lines.join("\n"));
  totalWritten++;
}

console.log(`✅ synthesize-domain-schemas: ${totalWritten} per-domain files in ${OUT_DIR}/`);
for (const [domain, files] of byDomain) {
  console.log(`  📄 ${domain}.sql — ${files.length} migrations`);
}
