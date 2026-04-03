#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Internal Agent Registry Generator
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";

const agentsDir = "src/lib/internal-agents/agents";
const agents: { name: string; file: string }[] = [];

if (fs.existsSync(agentsDir)) {
  for (const f of fs.readdirSync(agentsDir)) {
    if (f === "index.ts" || !f.endsWith(".ts")) continue;
    agents.push({ name: f.replace(".ts", ""), file: `${agentsDir}/${f}` });
  }
}

const out = { version: "1.0.0", generatedAt: new Date().toISOString(), total: agents.length, agents };
fs.writeFileSync("generated/internal-agent-registry.json", JSON.stringify(out, null, 2));
console.log(`✅ Generated internal agent registry: ${agents.length} agents`);
