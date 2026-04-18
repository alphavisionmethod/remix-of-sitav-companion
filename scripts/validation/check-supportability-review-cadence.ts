#!/usr/bin/env node
/* eslint-disable no-console */
import { existsSync, readFileSync } from "node:fs";
const F = "generated/final-hardening/drill-cadence-status.json";
if (!existsSync(F)) { console.error("❌ cadence status missing"); process.exit(1); }
const r = JSON.parse(readFileSync(F, "utf8"));
const overdue = (r.drills || []).filter((d: any) => d.overdue && d.severity === "block");
const ok = overdue.length === 0;
console.log(`${ok ? "✅" : "❌"} supportability-review-cadence: ${overdue.length} block-level overdue`);
process.exit(ok ? 0 : 1);
