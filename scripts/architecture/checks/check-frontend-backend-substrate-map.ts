#!/usr/bin/env node
/* eslint-disable no-console */
// Phase L — Warn-level guardrail: frontend↔backend substrate matrix
import { readJsonSafe } from "../lib/utils";

interface Matrix { totalActions: number; realActions: number; pendingActions: number }
const data = readJsonSafe<Matrix>("generated/deployment-gap-closure/frontend-backend-substrate-matrix.json");
if (!data) { console.warn("⚠ evidence missing"); process.exit(0); }
const realRatio = data.realActions / data.totalActions;
const ok = realRatio >= 0.7;
console.log(`${ok ? "✅" : "⚠"} FE/BE matrix: ${data.realActions}/${data.totalActions} real (${(realRatio * 100).toFixed(0)}%), ${data.pendingActions} pending`);
process.exit(0);
