#!/usr/bin/env node
/* eslint-disable no-console */
import { existsSync } from "node:fs";
const required = [
  "generated/restore-and-oauth-hardening/OAUTH_REFRESH_OPERATOR_VISIBILITY.md",
  "generated/restore-and-oauth-hardening/oauth-refresh-probe-status.json",
  "src/components/admin/OAuthRefreshHealthBoard.tsx",
];
const missing = required.filter(p => !existsSync(p));
const ok = missing.length === 0;
console.log(`${ok ? "✅" : "❌"} provider-health-surfacing: ${missing.length ? "missing " + missing.join(",") : "all surfaces present"}`);
process.exit(ok ? 0 : 1);
