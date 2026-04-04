#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Capability Quality Metric Generator
// Computes quality score per capability based on heuristics
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";

const capIndex = JSON.parse(fs.readFileSync("generated/capability-index.json", "utf-8"));
const capabilities: { id?: string; name?: string; domain: string; source?: string; riskTier: string }[] = capIndex.capabilities || [];

function fileExists(p: string): boolean { try { return fs.statSync(p).isFile(); } catch { return false; } }
function dirExists(p: string): boolean { try { return fs.statSync(p).isDirectory(); } catch { return false; } }

function hasBarrelExport(capName: string): boolean {
  const domainDirs = ["business-contracts", "finance-contracts", "concierge-contracts", "policy-contracts", "contracts"];
  for (const d of domainDirs) {
    const barrel = `src/packages/${d}/index.ts`;
    if (fileExists(barrel)) {
      const content = fs.readFileSync(barrel, "utf-8");
      if (content.includes(capName)) return true;
    }
  }
  return false;
}

function hasServiceConsumer(capName: string): boolean {
  const servicesDir = "src/lib/services";
  if (!dirExists(servicesDir)) return false;
  const dirs = fs.readdirSync(servicesDir, { withFileTypes: true }).filter(d => d.isDirectory());
  for (const dir of dirs) {
    const indexPath = path.join(servicesDir, dir.name, "index.ts");
    if (fileExists(indexPath)) {
      const content = fs.readFileSync(indexPath, "utf-8");
      if (content.includes(capName)) return true;
    }
  }
  return false;
}

function hasTestCoverage(capName: string): boolean {
  const testDir = "src/test";
  if (!dirExists(testDir)) return false;
  const files = fs.readdirSync(testDir).filter(f => f.endsWith(".test.ts") || f.endsWith(".test.tsx"));
  for (const f of files) {
    const content = fs.readFileSync(path.join(testDir, f), "utf-8");
    if (content.includes(capName)) return true;
  }
  return false;
}

const metrics = capabilities.map(cap => {
  const hasExport = hasBarrelExport(cap.name);
  const hasConsumer = hasServiceConsumer(cap.name);
  const hasTest = hasTestCoverage(cap.name);
  const sourceExists = cap.source ? fileExists(cap.source) : false;

  let score = 0;
  if (sourceExists) score += 25;
  if (hasExport) score += 25;
  if (hasConsumer) score += 25;
  if (hasTest) score += 25;

  return {
    capabilityId: cap.id || cap.name || '',
    domain: cap.domain,
    riskTier: cap.riskTier,
    checks: { sourceExists, hasBarrelExport: hasExport, hasServiceConsumer: hasConsumer, hasTestCoverage: hasTest },
    qualityScore: score,
    grade: score >= 75 ? "A" : score >= 50 ? "B" : score >= 25 ? "C" : "D",
  };
});

const avgScore = metrics.length > 0 ? Math.round(metrics.reduce((s, m) => s + m.qualityScore, 0) / metrics.length) : 0;

const out = {
  version: "1.0.0",
  generatedAt: new Date().toISOString(),
  total: metrics.length,
  averageQualityScore: avgScore,
  gradeDistribution: {
    A: metrics.filter(m => m.grade === "A").length,
    B: metrics.filter(m => m.grade === "B").length,
    C: metrics.filter(m => m.grade === "C").length,
    D: metrics.filter(m => m.grade === "D").length,
  },
  metrics,
};

fs.writeFileSync("generated/capability-quality-metric.json", JSON.stringify(out, null, 2));
console.log(`✅ Generated capability quality metrics: ${metrics.length} capabilities, avg score ${avgScore}`);
