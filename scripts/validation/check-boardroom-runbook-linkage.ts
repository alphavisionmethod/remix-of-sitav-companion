#!/usr/bin/env node
/* eslint-disable no-console */
import { existsSync, readFileSync } from "node:fs";
const F = "generated/final-hardening/boardroom-runbook-status.json";
const RB = "generated/final-hardening/BOARDROOM_FOLLOWTHROUGH_RUNBOOK.md";
if (!existsSync(F) || !existsSync(RB)) { console.error("❌ runbook artifacts missing"); process.exit(1); }
const s = JSON.parse(readFileSync(F, "utf-8"));
const ok = s.linkedToAdminSurfaces === true && s.failureModesCovered >= 7 && s.ownerAssigned === true;
console.log(`${ok ? "✅" : "❌"} boardroom-runbook-linkage: modes=${s.failureModesCovered} owner=${s.ownerAssigned} linked=${s.linkedToAdminSurfaces}`);
process.exit(ok ? 0 : 1);
