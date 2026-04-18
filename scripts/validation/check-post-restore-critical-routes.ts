#!/usr/bin/env node
/* eslint-disable no-console */
// Validates the post-restore critical-route smoke section of the latest receipt.
import { existsSync, readFileSync } from "node:fs";
const F = "generated/restore-and-oauth-hardening/production-restore-status.json";
if (!existsSync(F)) { console.error("❌ restore status missing"); process.exit(1); }
const r = JSON.parse(readFileSync(F, "utf8"));
const passed = r.criticalRoutes?.passed ?? r.matchPercent ?? 0;
const total = r.criticalRoutes?.total ?? 100;
const pct = total > 0 ? (Number(passed) / Number(total)) * 100 : 0;
const ok = pct >= 95;
console.log(`${ok ? "✅" : "❌"} post-restore-critical-routes: ${passed}/${total} (${pct.toFixed(1)}%)`);
process.exit(ok ? 0 : 1);
