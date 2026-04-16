#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Contract Manifest Generator
// Scans all contract packages, lists every exported type
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";

interface ContractEntry {
  name: string;
  kind: "interface" | "type" | "const" | "enum" | "function";
  package: string;
  file: string;
}

const contracts: ContractEntry[] = [];

function scanDir(dir: string, packageName: string) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDir(fullPath, packageName);
    } else if (entry.name.endsWith(".ts") && !entry.name.endsWith(".test.ts") && !entry.name.endsWith(".d.ts")) {
      const content = fs.readFileSync(fullPath, "utf-8");
      const patterns: [RegExp, ContractEntry["kind"]][] = [
        [/export\s+interface\s+(\w+)/g, "interface"],
        [/export\s+type\s+(\w+)/g, "type"],
        [/export\s+const\s+(\w+)/g, "const"],
        [/export\s+enum\s+(\w+)/g, "enum"],
        [/export\s+function\s+(\w+)/g, "function"],
      ];
      for (const [regex, kind] of patterns) {
        for (const match of content.matchAll(regex)) {
          contracts.push({ name: match[1], kind, package: packageName, file: fullPath });
        }
      }
    }
  }
}

const contractDirs = fs.readdirSync("src/packages", { withFileTypes: true })
  .filter(d => d.isDirectory() && (d.name.includes("contracts") || d.name === "proof-model" || d.name === "policy-contracts"))
  .map(d => d.name);

for (const dir of contractDirs) {
  scanDir(`src/packages/${dir}`, dir);
}

const packageSummary = contractDirs.map(pkg => ({
  package: pkg,
  totalExports: contracts.filter(c => c.package === pkg).length,
  interfaces: contracts.filter(c => c.package === pkg && c.kind === "interface").length,
  types: contracts.filter(c => c.package === pkg && c.kind === "type").length,
  constants: contracts.filter(c => c.package === pkg && c.kind === "const").length,
}));

const out = {
  version: "1.0.0",
  generatedAt: new Date().toISOString(),
  totalContracts: contracts.length,
  totalPackages: contractDirs.length,
  packageSummary,
  contracts,
};

fs.writeFileSync("generated/contract-manifest.json", JSON.stringify(out, null, 2));
console.log(`✅ Generated contract manifest: ${contracts.length} exports across ${contractDirs.length} packages`);
