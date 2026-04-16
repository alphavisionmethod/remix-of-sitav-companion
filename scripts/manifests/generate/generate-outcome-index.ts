#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Outcome Index Generator
// Maps pack store outcomes to capabilities
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";

const packStore = "src/lib/pack-store/index.ts";
const outcomes: { name: string; source: string }[] = [];

if (fs.existsSync(packStore)) {
  const content = fs.readFileSync(packStore, "utf-8");
  const matches = content.match(/export\s+(?:const|function|interface|type)\s+(\w+)/g) || [];
  for (const m of matches) {
    outcomes.push({ name: m.replace(/export\s+(?:const|function|interface|type)\s+/, ""), source: packStore });
  }
}

const out = { version: "1.0.0", generatedAt: new Date().toISOString(), total: outcomes.length, outcomes };
fs.writeFileSync("generated/outcome-index.json", JSON.stringify(out, null, 2));
console.log(`✅ Generated outcome index: ${outcomes.length} outcomes`);
