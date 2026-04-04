#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Test Run Risk Tier Matrix
// Maps test coverage to risk tiers, reports untested capabilities
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import { scanDir, readFileContent, readJsonSafe, loadCapabilityIndex, writeJsonOutput, envelope } from "../architecture/lib/utils";

const capIndex = loadCapabilityIndex();
const capabilities = capIndex?.capabilities || capIndex?.entries || [];

// Discover test files
const testFiles = [
  ...scanDir("src/test", [".test.ts", ".test.tsx", ".spec.ts"]),
  ...scanDir("src", [".test.ts", ".test.tsx"]),
];

const testContents = testFiles.map(f => ({ file: f, content: readFileContent(f) }));

interface RiskTier {
  capabilityId: string;
  riskLevel: "critical" | "high" | "medium" | "low";
  hasTest: boolean;
  testFiles: string[];
}

const riskMatrix: RiskTier[] = [];

for (const cap of capabilities) {
  const id = cap.id || cap.name;
  const domain = cap.domain || "platform";

  // Determine risk level
  let riskLevel: "critical" | "high" | "medium" | "low" = "medium";
  if (id.includes("auth") || id.includes("payment") || id.includes("identity") || id.includes("security")) {
    riskLevel = "critical";
  } else if (id.includes("billing") || id.includes("finance") || id.includes("capital")) {
    riskLevel = "high";
  } else if (id.includes("config") || id.includes("setting") || id.includes("preference")) {
    riskLevel = "low";
  }

  // Find matching tests
  const matchingTests = testContents
    .filter(t => t.content.includes(id) || t.content.toLowerCase().includes(id.replace(/-/g, "")))
    .map(t => t.file);

  riskMatrix.push({
    capabilityId: id,
    riskLevel,
    hasTest: matchingTests.length > 0,
    testFiles: matchingTests,
  });
}

// Report
const critical = riskMatrix.filter(r => r.riskLevel === "critical");
const untestedCritical = critical.filter(r => !r.hasTest);
const totalTested = riskMatrix.filter(r => r.hasTest).length;

console.log(`📊 Risk Tier Matrix:`);
console.log(`   Total capabilities: ${riskMatrix.length}`);
console.log(`   Tested: ${totalTested} (${Math.round(totalTested / riskMatrix.length * 100)}%)`);
console.log(`   Critical: ${critical.length} (${untestedCritical.length} untested)`);

if (untestedCritical.length > 0) {
  console.log(`\n⚠️ Untested critical capabilities:`);
  for (const r of untestedCritical) {
    console.log(`   ❌ ${r.capabilityId}`);
  }
}
