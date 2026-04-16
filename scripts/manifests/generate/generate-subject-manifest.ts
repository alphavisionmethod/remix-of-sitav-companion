#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Subject Manifest Generator
// Catalogs all entity types/subjects used across the system
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";

const contractsDir = "src/packages/contracts/index.ts";
const subjects: { name: string; kind: string }[] = [];

if (fs.existsSync(contractsDir)) {
  const content = fs.readFileSync(contractsDir, "utf-8");
  const interfaces = content.match(/export\s+interface\s+(\w+)/g) || [];
  const types = content.match(/export\s+type\s+(\w+)/g) || [];
  for (const m of interfaces) subjects.push({ name: m.replace("export interface ", ""), kind: "interface" });
  for (const m of types) subjects.push({ name: m.replace("export type ", ""), kind: "type" });
}

const out = { version: "1.0.0", generatedAt: new Date().toISOString(), total: subjects.length, subjects };
fs.writeFileSync("generated/subject-manifest.json", JSON.stringify(out, null, 2));
console.log(`✅ Generated subject manifest: ${subjects.length} subjects`);
