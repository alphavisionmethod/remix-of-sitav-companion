#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Service Manifest Generator
// Scans src/lib/services/ and generates generated/service-manifest.json
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";

interface ServiceEntry {
  name: string;
  domain: string;
  path: string;
  exports: string[];
}

const servicesDir = path.join(process.cwd(), "src/lib/services");
const manifest: { version: string; generatedAt: string; services: ServiceEntry[] } = {
  version: "2.0.0",
  generatedAt: new Date().toISOString(),
  services: [],
};

function extractExports(content: string): string[] {
  const exports: string[] = [];
  const re = /export\s+(?:function|class|const|interface|type)\s+(\w+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) exports.push(m[1]);
  return exports;
}

if (fs.existsSync(servicesDir)) {
  for (const domain of fs.readdirSync(servicesDir, { withFileTypes: true })) {
    if (!domain.isDirectory()) continue;
    const domainPath = path.join(servicesDir, domain.name);
    for (const file of fs.readdirSync(domainPath)) {
      if (!file.endsWith(".ts") || file === "index.ts") continue;
      const filePath = path.join(domainPath, file);
      const content = fs.readFileSync(filePath, "utf-8");
      manifest.services.push({
        name: file.replace(".ts", "").replace(".service", ""),
        domain: domain.name,
        path: `src/lib/services/${domain.name}/${file}`,
        exports: extractExports(content),
      });
    }
  }
}

const outPath = path.join(process.cwd(), "generated/service-manifest.json");
fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2));
console.log(`✅ Generated service manifest: ${manifest.services.length} services → ${outPath}`);
