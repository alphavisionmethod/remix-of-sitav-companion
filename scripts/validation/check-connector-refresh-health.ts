#!/usr/bin/env node
/* eslint-disable no-console */
import { existsSync, readFileSync } from "node:fs";
const F = "generated/restore-and-oauth-hardening/oauth-refresh-probe-status.json";
if (!existsSync(F)) { console.error("❌ probe status missing"); process.exit(1); }
const s = JSON.parse(readFileSync(F, "utf-8"));
const providers = s.providers ?? {};
const unhealthy = Object.entries(providers).filter(([, v]: [string, any]) => v.status === "failing").map(([k]) => k);
const ok = unhealthy.length === 0 && s.cadenceRegistered === true;
console.log(`${ok ? "✅" : "❌"} connector-refresh-health: ${Object.keys(providers).length} providers, ${unhealthy.length} failing`);
if (unhealthy.length) console.error(`  failing: ${unhealthy.join(", ")}`);
process.exit(ok ? 0 : 1);
