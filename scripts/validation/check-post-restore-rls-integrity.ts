#!/usr/bin/env node
/* eslint-disable no-console */
// Asserts restore drill receipts include RLS-coverage assertions.
import { existsSync, readFileSync } from "node:fs";
const F = "generated/restore-and-oauth-hardening/production-restore-status.json";
if (!existsSync(F)) { console.error("❌ restore status missing"); process.exit(1); }
const r = JSON.parse(readFileSync(F, "utf8"));
const rls = r.rlsCoverage ?? r.rls_coverage ?? r.matchPercent ?? 0;
const ok = Number(rls) >= 95;
console.log(`${ok ? "✅" : "❌"} post-restore-rls-integrity: coverage=${rls}%`);
process.exit(ok ? 0 : 1);
