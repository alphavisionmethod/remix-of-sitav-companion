#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Capability Index Generator
// Scans packages/contracts and generates capability-index.json
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";

interface Capability { name: string; domain: string; source: string; riskTier: string }

const capabilities: Capability[] = [];

function scanPackage(dir: string, domain: string) {
  if (!fs.existsSync(dir)) return;
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    if (f.isDirectory()) {
      scanPackage(path.join(dir, f.name), domain);
    } else if (f.name.endsWith(".ts") && f.name !== "index.ts") {
      const content = fs.readFileSync(path.join(dir, f.name), "utf-8");
      const typeMatches = content.match(/export\s+(?:interface|type)\s+(\w+)/g) || [];
      for (const tm of typeMatches) {
        const name = tm.replace(/export\s+(?:interface|type)\s+/, "");
        const riskTier = name.toLowerCase().includes("payment") || name.toLowerCase().includes("execution")
          ? "high" : name.toLowerCase().includes("approval") ? "medium" : "low";
        capabilities.push({ name, domain, source: `${dir}/${f.name}`, riskTier });
      }
    }
  }
}

scanPackage("src/packages/business-contracts", "business");
scanPackage("src/packages/finance-contracts", "finance");
scanPackage("src/packages/concierge-contracts", "concierge");
scanPackage("src/packages/policy-contracts", "policy");

const out = { version: "2.0.0", generatedAt: new Date().toISOString(), total: capabilities.length, capabilities };
fs.writeFileSync("generated/capability-index.json", JSON.stringify(out, null, 2));
console.log(`✅ Generated capability index: ${capabilities.length} capabilities`);
