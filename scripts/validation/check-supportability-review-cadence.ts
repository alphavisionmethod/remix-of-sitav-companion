#!/usr/bin/env node
/* eslint-disable no-console */
import { existsSync, readFileSync } from "node:fs";
const F = "generated/final-hardening/drill-cadence-status.json";
if (!existsSync(F)) { console.error("❌ cadence status missing"); process.exit(1); }
const s = JSON.parse(readFileSync(F, "utf-8"));
const required = ["restore", "connector-refresh", "release-artifact", "baseline-seal", "notification-calmness", "admin-golden-path"];
const present = new Set(s.categoriesCovered ?? []);
const missing = required.filter(r => !present.has(r));
const ok = missing.length === 0;
console.log(`${ok ? "✅" : "❌"} supportability-cadence: ${present.size}/${required.length} categories`);
if (missing.length) console.error(`  missing: ${missing.join(", ")}`);
process.exit(ok ? 0 : 1);
