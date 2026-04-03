#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Formula Registry Generator
// Scans domain engines for computation functions
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";

const engineFiles = [
  "src/lib/domain-engines/business-os.ts",
  "src/lib/domain-engines/finance-os.ts",
  "src/lib/domain-engines/concierge-os.ts",
  "src/lib/domain-engines/investment-office.ts",
  "src/lib/domain-engines/revenue-autopilot.ts",
];

interface Formula { name: string; domain: string; source: string }
const formulas: Formula[] = [];

for (const f of engineFiles) {
  if (!fs.existsSync(f)) continue;
  const content = fs.readFileSync(f, "utf-8");
  const domain = path.basename(f, ".ts");
  const matches = content.match(/export\s+function\s+(\w+)/g) || [];
  for (const m of matches) {
    formulas.push({ name: m.replace("export function ", ""), domain, source: f });
  }
}

const out = { version: "1.0.0", generatedAt: new Date().toISOString(), total: formulas.length, formulas };
fs.writeFileSync("generated/formula-registry.json", JSON.stringify(out, null, 2));
console.log(`✅ Generated formula registry: ${formulas.length} formulas`);
