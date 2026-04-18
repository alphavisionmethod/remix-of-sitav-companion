#!/usr/bin/env node
/* eslint-disable no-console */
// Phase L (graduated to BLOCK in Phase R) — file picker adoption.
// Asserts raw <input type="file"> count never regresses above sealed baseline.
import { readJsonSafe } from "../lib/utils";

const BASELINE_RAW_INPUTS = 5; // Phase R: lowered after FileExplorerToolbar migration to canonical picker
const MIN_CANONICAL_CONSUMERS = 2; // FilePickerService + FileExplorerToolbar
const data = readJsonSafe<{ rawFileInputCount: number; canonicalConsumerCount: number }>("generated/deployment-gap-closure/file-picker-adoption-map.json");
if (!data) { console.error("❌ evidence missing — run gap-closure:evidence"); process.exit(1); }
const regressed = data.rawFileInputCount > BASELINE_RAW_INPUTS;
const tooFewCanonical = data.canonicalConsumerCount < MIN_CANONICAL_CONSUMERS;
const ok = !regressed && !tooFewCanonical;
console.log(`${ok ? "✅" : "❌"} File picker: ${data.rawFileInputCount} raw inputs (max ${BASELINE_RAW_INPUTS}), ${data.canonicalConsumerCount} canonical (min ${MIN_CANONICAL_CONSUMERS})`);
process.exit(ok ? 0 : 1);
