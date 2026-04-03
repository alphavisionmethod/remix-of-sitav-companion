#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Prompt Index Generator
// Reads docs/architecture/registry/prompts.yaml references
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";

const promptsFile = "docs/architecture/registry/prompts.yaml";
const content = fs.existsSync(promptsFile) ? fs.readFileSync(promptsFile, "utf-8") : "";

const prompts = content.split("\n").filter(l => l.trim().startsWith("- ")).map(l => l.trim().replace(/^-\s*/, ""));

const out = { version: "1.0.0", generatedAt: new Date().toISOString(), total: prompts.length, prompts };
fs.writeFileSync("generated/prompt-index.json", JSON.stringify(out, null, 2));
console.log(`✅ Generated prompt index: ${prompts.length} prompts`);
