#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Boardroom Template Index Generator
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";

const boardroomFile = "docs/architecture/registry/boardrooms.yaml";
const content = fs.existsSync(boardroomFile) ? fs.readFileSync(boardroomFile, "utf-8") : "";
const templates = content.split("\n").filter(l => l.trim().startsWith("- ")).map(l => l.trim().replace(/^-\s*/, ""));

const out = { version: "1.0.0", generatedAt: new Date().toISOString(), total: templates.length, templates };
fs.writeFileSync("generated/boardroom-template-index.json", JSON.stringify(out, null, 2));
console.log(`✅ Generated boardroom template index: ${templates.length} templates`);
