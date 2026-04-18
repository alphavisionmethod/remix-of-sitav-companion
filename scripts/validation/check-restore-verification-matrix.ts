#!/usr/bin/env node
/* eslint-disable no-console */
import { existsSync, readFileSync } from "node:fs";
const F = "generated/restore-and-oauth-hardening/post-restore-verification-matrix.json";
if (!existsSync(F)) { console.error("❌ matrix missing"); process.exit(1); }
const m = JSON.parse(readFileSync(F, "utf8"));
const blocking = (m.checks || []).filter((c: any) => c.severity === "block").length;
const ok = blocking >= 8;
console.log(`${ok ? "✅" : "❌"} restore-verification-matrix: ${blocking} blocking checks`);
process.exit(ok ? 0 : 1);
