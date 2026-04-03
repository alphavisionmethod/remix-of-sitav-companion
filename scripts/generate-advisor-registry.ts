#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Advisor Registry Generator
// Scans advisor config packages and edge functions
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";

const configDir = "src/packages/advisor-config";
const advisors: { name: string; source: string }[] = [];

if (fs.existsSync(configDir)) {
  const content = fs.readFileSync(path.join(configDir, "index.ts"), "utf-8");
  const matches = content.match(/export\s+const\s+(\w+)/g) || [];
  for (const m of matches) advisors.push({ name: m.replace("export const ", ""), source: configDir });
}

const out = { version: "1.0.0", generatedAt: new Date().toISOString(), total: advisors.length, advisors };
fs.writeFileSync("generated/advisor-registry.json", JSON.stringify(out, null, 2));
console.log(`✅ Generated advisor registry: ${advisors.length} advisors`);
