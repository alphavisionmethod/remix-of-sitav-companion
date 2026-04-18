#!/usr/bin/env node
/* eslint-disable no-console */
// Validates OAuth refresh probe coverage for Google / Microsoft / Slack.
import { existsSync, readFileSync } from "node:fs";

const STATUS = "generated/restore-and-oauth-hardening/oauth-refresh-probe-status.json";
const REQUIRED = ["google", "microsoft", "slack"];

if (!existsSync(STATUS)) {
  console.error("❌ oauth-refresh-probe-status.json missing");
  process.exit(1);
}
const s = JSON.parse(readFileSync(STATUS, "utf-8"));
const missing = REQUIRED.filter(p => !s.providers || !(p in s.providers));
const ok = missing.length === 0 && s.edgeFunctionDeployed === true && s.cadenceRegistered === true;
console.log(`${ok ? "✅" : "❌"} oauth-probe: providers=${REQUIRED.filter(p => s.providers?.[p]).join(",")} fn=${s.edgeFunctionDeployed} cadence=${s.cadenceRegistered}`);
if (missing.length > 0) console.error(`  missing providers: ${missing.join(", ")}`);
process.exit(ok ? 0 : 1);
