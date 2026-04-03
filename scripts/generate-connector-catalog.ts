#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Connector Catalog Generator
// Reads docs/architecture/registry/connectors.yaml
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";

const file = "docs/architecture/registry/connectors.yaml";
const content = fs.existsSync(file) ? fs.readFileSync(file, "utf-8") : "";
const connectors = content.split("\n").filter(l => l.trim().startsWith("- ")).map(l => l.trim().replace(/^-\s*/, ""));

const out = { version: "1.0.0", generatedAt: new Date().toISOString(), total: connectors.length, connectors };
fs.writeFileSync("generated/connector-catalog.json", JSON.stringify(out, null, 2));
console.log(`✅ Generated connector catalog: ${connectors.length} connectors`);
