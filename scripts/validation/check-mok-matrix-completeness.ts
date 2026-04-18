#!/usr/bin/env node
/* eslint-disable no-console */
import { existsSync, readFileSync } from "node:fs";
const F = "generated/final-hardening/mok-test-matrix.json";
if (!existsSync(F)) { console.error("❌ mok matrix missing"); process.exit(1); }
const r = JSON.parse(readFileSync(F, "utf8"));
const verified = (r.distros || []).filter((d: any) => d.status === "verified" || d.status === "verified-manual");
const ok = verified.length >= 3;
console.log(`${ok ? "✅" : "❌"} mok-matrix-completeness: ${verified.length} distro(s) verified`);
process.exit(ok ? 0 : 1);
