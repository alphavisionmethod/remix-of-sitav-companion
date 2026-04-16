#!/usr/bin/env node
// SITA OS — Service Consolidation Runner
const fs = require("fs");
const path = require("path");
const manifest = fs.existsSync("generated/service-consolidation-manifest.json") ? JSON.parse(fs.readFileSync("generated/service-consolidation-manifest.json", "utf-8")) : null;
if (!manifest) { console.log("⚠️ No consolidation manifest"); process.exit(0); }
const entries = manifest.services || manifest.entries || [];
const merges = entries.filter(e => e.mergedInto && e.status === "deprecated");
console.log(`📊 ${merges.length} services marked for consolidation`);
for (const m of merges) { console.log(`  → ${m.id || m.serviceId} → ${m.mergedInto}`); }
