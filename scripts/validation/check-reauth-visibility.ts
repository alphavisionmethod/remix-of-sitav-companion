#!/usr/bin/env node
/* eslint-disable no-console */
import { execSync } from "node:child_process";
// Verify reauth UX surfaces exist in connected-services and admin boards
const REQUIRED = ["OAuthRefreshHealthBoard", "reauth_required", "degraded"];
let pass = 0;
for (const term of REQUIRED) {
  try {
    const out = execSync(`grep -rl "${term}" src/components src/pages 2>/dev/null || true`, { encoding: "utf-8" });
    if (out.trim()) pass++;
  } catch {}
}
const ok = pass === REQUIRED.length;
console.log(`${ok ? "✅" : "❌"} reauth-visibility: ${pass}/${REQUIRED.length} surfaces present`);
process.exit(ok ? 0 : 1);
