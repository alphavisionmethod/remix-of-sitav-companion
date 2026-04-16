#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Runtime Conformance Manifest Generator
// Validates each service dir has barrel export, factory, types
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";

interface ConformanceEntry {
  serviceId: string;
  path: string;
  hasBarrelExport: boolean;
  hasFactoryFunction: boolean;
  hasTypeExports: boolean;
  hasTestFile: boolean;
  conformanceScore: number;
  issues: string[];
}

const entries: ConformanceEntry[] = [];
const servicesDir = "src/lib/services";

if (fs.existsSync(servicesDir)) {
  for (const dir of fs.readdirSync(servicesDir, { withFileTypes: true }).filter(d => d.isDirectory())) {
    const dirPath = path.join(servicesDir, dir.name);
    const files = fs.readdirSync(dirPath);
    const issues: string[] = [];

    // Check barrel
    const hasBarrel = files.some(f => f === "index.ts");
    if (!hasBarrel) issues.push("Missing barrel export (index.ts)");

    // Check factory function
    let hasFactory = false;
    let hasTypes = false;
    for (const f of files.filter(f => f.endsWith(".ts"))) {
      const content = fs.readFileSync(path.join(dirPath, f), "utf-8");
      if (content.match(/export\s+function\s+create\w+/)) hasFactory = true;
      if (content.match(/export\s+(?:interface|type)\s+\w+/)) hasTypes = true;
    }
    if (!hasFactory) issues.push("Missing factory function (create*)");
    if (!hasTypes) issues.push("Missing type exports");

    // Check test
    const hasTest = files.some(f => f.endsWith(".test.ts") || f.endsWith(".test.tsx"));
    if (!hasTest) issues.push("Missing test file");

    let score = 0;
    if (hasBarrel) score += 25;
    if (hasFactory) score += 25;
    if (hasTypes) score += 25;
    if (hasTest) score += 25;

    entries.push({
      serviceId: dir.name,
      path: dirPath,
      hasBarrelExport: hasBarrel,
      hasFactoryFunction: hasFactory,
      hasTypeExports: hasTypes,
      hasTestFile: hasTest,
      conformanceScore: score,
      issues,
    });
  }
}

const avgScore = entries.length > 0 ? Math.round(entries.reduce((s, e) => s + e.conformanceScore, 0) / entries.length) : 0;
const passing = entries.filter(e => e.conformanceScore >= 75).length;

const out = {
  version: "1.0.0",
  generatedAt: new Date().toISOString(),
  totalServices: entries.length,
  passingServices: passing,
  averageConformanceScore: avgScore,
  entries,
};

fs.writeFileSync("generated/runtime-conformance-manifest.json", JSON.stringify(out, null, 2));
console.log(`✅ Generated runtime conformance: ${passing}/${entries.length} services passing (avg ${avgScore})`);
