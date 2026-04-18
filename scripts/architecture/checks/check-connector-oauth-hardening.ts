#!/usr/bin/env node
/* eslint-disable no-console */
// Phase L — Warn-level guardrail: connector OAuth hardening
import { readJsonSafe } from "../lib/utils";

interface Map { providers: Record<string, { status: string }>; classification: string }
const data = readJsonSafe<Map>("generated/deployment-gap-closure/connector-oauth-rotation-map.json");
if (!data) { console.warn("⚠ evidence missing"); process.exit(0); }
const labels = Object.entries(data.providers).map(([k, v]) => `${k}=${v.status}`).join(", ");
const allLabeled = Object.values(data.providers).every(p => p.status && p.status.length > 0);
console.log(`${allLabeled ? "✅" : "⚠"} Connector OAuth: ${labels}`);
process.exit(0);
