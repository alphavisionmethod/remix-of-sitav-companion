#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Capability Family Index Generator
// Groups capabilities by domain family with counts
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";

const capIndex = JSON.parse(fs.readFileSync("generated/capability-index.json", "utf-8"));
const capabilities: { id?: string; name?: string; domain: string; riskTier: string; family?: string }[] = capIndex.capabilities || [];

const families: Record<string, { domain: string; capabilities: string[]; riskDistribution: Record<string, number> }> = {};

for (const cap of capabilities) {
  const family = cap.domain || "unknown";
  if (!families[family]) families[family] = { domain: family, capabilities: [], riskDistribution: {} };
  families[family].capabilities.push(cap.id || cap.name || '');
  families[family].riskDistribution[cap.riskTier] = (families[family].riskDistribution[cap.riskTier] || 0) + 1;
}

const familyIndex = Object.entries(families).map(([domain, data]) => ({
  domain,
  totalCapabilities: data.capabilities.length,
  capabilities: data.capabilities,
  riskDistribution: data.riskDistribution,
}));

const out = {
  version: "1.0.0",
  generatedAt: new Date().toISOString(),
  totalFamilies: familyIndex.length,
  totalCapabilities: capabilities.length,
  families: familyIndex,
};

fs.writeFileSync("generated/capability-family-index.json", JSON.stringify(out, null, 2));
console.log(`✅ Generated capability family index: ${familyIndex.length} families, ${capabilities.length} capabilities`);
