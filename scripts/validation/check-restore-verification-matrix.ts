#!/usr/bin/env node
/* eslint-disable no-console */
import { existsSync, readFileSync } from "node:fs";
const F = "generated/restore-and-oauth-hardening/post-restore-verification-matrix.json";
if (!existsSync(F)) { console.error("❌ matrix missing"); process.exit(1); }
const m = JSON.parse(readFileSync(F, "utf-8"));
const required = ["schema", "rls", "data_integrity", "critical_routes", "edge_functions", "admin_truth"];
const missing = required.filter(r => !m.checks?.[r]);
const ok = missing.length === 0 && m.passRate >= 0.95;
console.log(`${ok ? "✅" : "❌"} restore-matrix: ${Object.keys(m.checks ?? {}).length} dims, pass=${(m.passRate * 100).toFixed(1)}%`);
if (missing.length) console.error(`  missing: ${missing.join(", ")}`);
process.exit(ok ? 0 : 1);
