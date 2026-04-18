#!/usr/bin/env node
/* eslint-disable no-console */
// Phase L (graduated to BLOCK in Phase R) — frontend↔backend substrate matrix.
// Asserts at least 85% of mapped actions are real-substrate-backed.
import { readJsonSafe } from "../lib/utils";

interface Matrix { totalActions: number; realActions: number; pendingActions: number; archivedActions: number }
const MIN_REAL_RATIO = 0.85; // Phase R baseline: ≥14/16 real (87.5%)
const data = readJsonSafe<Matrix>("generated/deployment-gap-closure/frontend-backend-substrate-matrix.json");
if (!data) { console.error("❌ evidence missing"); process.exit(1); }
const realRatio = data.realActions / data.totalActions;
const ok = realRatio >= MIN_REAL_RATIO;
console.log(`${ok ? "✅" : "❌"} FE/BE matrix: ${data.realActions}/${data.totalActions} real (${(realRatio * 100).toFixed(0)}%), ${data.pendingActions} pending, ${data.archivedActions} archived (min ratio ${(MIN_REAL_RATIO * 100).toFixed(0)}%)`);
process.exit(ok ? 0 : 1);
