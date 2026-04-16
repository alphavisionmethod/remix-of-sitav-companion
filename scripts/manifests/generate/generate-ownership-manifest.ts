#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Ownership Manifest Generator
// Maps service directories to owner teams
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";

interface OwnershipEntry {
  path: string;
  ownerTeam: string;
  domain: string;
  classification: "service" | "package" | "edge-function" | "infrastructure" | "test" | "script";
}

const entries: OwnershipEntry[] = [];

function classifyOwner(dirName: string): { team: string; domain: string } {
  if (dirName.includes("business") || dirName.includes("crm") || dirName.includes("revenue")) return { team: "business", domain: "business-os" };
  if (dirName.includes("finance") || dirName.includes("payment") || dirName.includes("billing")) return { team: "finance", domain: "finance-os" };
  if (dirName.includes("concierge") || dirName.includes("booking") || dirName.includes("calendar")) return { team: "concierge", domain: "concierge-os" };
  if (dirName.includes("admin") || dirName.includes("support")) return { team: "platform-admin", domain: "admin" };
  if (dirName.includes("security") || dirName.includes("fraud") || dirName.includes("healing")) return { team: "platform-security", domain: "security" };
  return { team: "platform-core", domain: "platform" };
}

// Services
const servicesDir = "src/lib/services";
if (fs.existsSync(servicesDir)) {
  for (const d of fs.readdirSync(servicesDir, { withFileTypes: true }).filter(e => e.isDirectory())) {
    const { team, domain } = classifyOwner(d.name);
    entries.push({ path: path.join(servicesDir, d.name), ownerTeam: team, domain, classification: "service" });
  }
}

// Packages
const pkgDir = "src/packages";
if (fs.existsSync(pkgDir)) {
  for (const d of fs.readdirSync(pkgDir, { withFileTypes: true }).filter(e => e.isDirectory())) {
    const { team, domain } = classifyOwner(d.name);
    entries.push({ path: path.join(pkgDir, d.name), ownerTeam: team, domain, classification: "package" });
  }
}

// Edge functions
const fnDir = "supabase/functions";
if (fs.existsSync(fnDir)) {
  for (const d of fs.readdirSync(fnDir, { withFileTypes: true }).filter(e => e.isDirectory())) {
    const { team, domain } = classifyOwner(d.name);
    entries.push({ path: path.join(fnDir, d.name), ownerTeam: team, domain, classification: "edge-function" });
  }
}

const teamSummary: Record<string, number> = {};
for (const e of entries) {
  teamSummary[e.ownerTeam] = (teamSummary[e.ownerTeam] || 0) + 1;
}

const out = {
  version: "1.0.0",
  generatedAt: new Date().toISOString(),
  totalEntries: entries.length,
  teamSummary,
  entries,
};

fs.writeFileSync("generated/ownership-manifest.json", JSON.stringify(out, null, 2));
console.log(`✅ Generated ownership manifest: ${entries.length} entries across ${Object.keys(teamSummary).length} teams`);
