#!/usr/bin/env node
/* eslint-disable no-console */
import { execSync } from "node:child_process";
let wired = false;
try {
  const out = execSync(`grep -l "OAuthRefreshHealthBoard" src/pages/admin/integrations/IntegrationsHome.tsx 2>/dev/null || true`, { encoding: "utf-8" });
  wired = out.trim().length > 0;
} catch {}
console.log(`${wired ? "✅" : "❌"} provider-health-surfacing: admin integrations board ${wired ? "wired" : "missing"}`);
process.exit(wired ? 0 : 1);
