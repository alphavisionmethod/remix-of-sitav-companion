#!/usr/bin/env node
/* eslint-disable no-console */
// Phase L — Warn-level guardrail: file picker adoption
import { readJsonSafe } from "../lib/utils";

const BASELINE_RAW_INPUTS = 6; // sealed in Phase K
const data = readJsonSafe<{ rawFileInputCount: number; canonicalConsumerCount: number }>("generated/deployment-gap-closure/file-picker-adoption-map.json");
if (!data) { console.warn("⚠ evidence missing"); process.exit(0); }
const regressed = data.rawFileInputCount > BASELINE_RAW_INPUTS;
console.log(`${regressed ? "⚠" : "✅"} File picker: ${data.rawFileInputCount} raw inputs (baseline ${BASELINE_RAW_INPUTS}), ${data.canonicalConsumerCount} canonical`);
process.exit(0);
