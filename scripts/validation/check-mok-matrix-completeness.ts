#!/usr/bin/env node
/* eslint-disable no-console */
import { existsSync, readFileSync } from "node:fs";
const F = "generated/final-hardening/mok-test-matrix.json";
if (!existsSync(F)) { console.error("❌ MOK matrix missing"); process.exit(1); }
const m = JSON.parse(readFileSync(F, "utf-8"));
const required = ["ubuntu-24.04", "fedora-40", "arch"];
const distros = m.distros ?? {};
const missing = required.filter(d => !distros[d]);
const tested = Object.values(distros).filter((d: any) => d.secureBootTested === true && d.mokEnrollmentTested === true).length;
const ok = missing.length === 0 && tested >= 3;
console.log(`${ok ? "✅" : "❌"} mok-matrix: ${tested}/${Object.keys(distros).length} fully tested`);
if (missing.length) console.error(`  missing distros: ${missing.join(", ")}`);
process.exit(ok ? 0 : 1);
