#!/usr/bin/env node
/* eslint-disable no-console */
import { existsSync, readFileSync } from "node:fs";
const F = "generated/restore-and-oauth-hardening/post-restore-verification-matrix.json";
if (!existsSync(F)) { console.error("❌ matrix missing"); process.exit(1); }
const m = JSON.parse(readFileSync(F, "utf-8"));
const rls = m.checks?.rls;
const ok = rls?.status === "pass" && (rls?.coveragePct ?? 0) >= 100;
console.log(`${ok ? "✅" : "❌"} post-restore-rls: coverage=${rls?.coveragePct ?? 0}% tables=${rls?.totalTables ?? 0}`);
process.exit(ok ? 0 : 1);
