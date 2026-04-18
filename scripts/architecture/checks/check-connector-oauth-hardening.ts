#!/usr/bin/env node
/* eslint-disable no-console */
// Phase L (graduated to BLOCK in Phase Q) — Connector OAuth hardening
// Asserts Google real-implementation never regresses; all providers must be classified.
import { readJsonSafe } from "../lib/utils";

interface Map { providers: Record<string, { status: string }>; classification: string }
const data = readJsonSafe<Map>("generated/deployment-gap-closure/connector-oauth-rotation-map.json");
if (!data) { console.error("❌ connector-oauth-rotation-map.json missing"); process.exit(1); }
const google = data.providers?.google?.status ?? "unknown";
const allLabeled = Object.values(data.providers).every(p => p.status && p.status.length > 0);
const ok = google === "real-implementation" && allLabeled;
const labels = Object.entries(data.providers).map(([k, v]) => `${k}=${v.status}`).join(", ");
console.log(`${ok ? "✅" : "❌"} Connector OAuth: ${labels}`);
process.exit(ok ? 0 : 1);
