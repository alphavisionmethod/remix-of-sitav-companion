#!/usr/bin/env node
/* eslint-disable no-console */
import { existsSync, readFileSync } from "node:fs";
const F = "generated/restore-and-oauth-hardening/oauth-refresh-probe-status.json";
if (!existsSync(F)) { console.error("❌ probe status missing"); process.exit(1); }
const r = JSON.parse(readFileSync(F, "utf8"));
const providers = r.providers || {};
const required = ["google", "microsoft", "slack"];
const failing: string[] = [];
for (const p of required) {
  const s = providers[p];
  if (!s || (s.healthy ?? 0) === 0 && (s.total ?? 0) === 0 && r.totalProbes !== 0) failing.push(`${p}:no-data`);
  if (s && s.failing > s.healthy && s.total > 5) failing.push(`${p}:more-failing-than-healthy`);
}
const ok = failing.length === 0;
console.log(`${ok ? "✅" : "❌"} connector-refresh-health: ${failing.join(", ") || "all providers healthy"}`);
process.exit(ok ? 0 : 1);
