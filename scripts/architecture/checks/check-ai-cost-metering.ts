#!/usr/bin/env node
/* eslint-disable no-console */
// Phase L — Warn-level guardrail: AI cost metering
import { readJsonSafe } from "../lib/utils";

const data = readJsonSafe<{ classification: string; ledgerInstrumentationCount: number; aiGatewayEdgeFunction: boolean }>("generated/deployment-gap-closure/ai-cost-metering-map.json");
if (!data) { console.warn("⚠ evidence missing"); process.exit(0); }
const ok = data.classification === "real-metering" && data.aiGatewayEdgeFunction;
console.log(`${ok ? "✅" : "⚠"} AI metering: ${data.classification} (${data.ledgerInstrumentationCount} ledger writers)`);
process.exit(0);
