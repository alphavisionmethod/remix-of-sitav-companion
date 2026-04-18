#!/usr/bin/env node
/* eslint-disable no-console */
// Asserts the OAuth Refresh Health Board exists and is wired into /admin/integrations.
import { existsSync, readFileSync } from "node:fs";
const COMP = "src/components/admin/OAuthRefreshHealthBoard.tsx";
const HUB = "src/pages/admin/integrations/IntegrationsHome.tsx";
const errors: string[] = [];
if (!existsSync(COMP)) errors.push("missing OAuthRefreshHealthBoard component");
if (!existsSync(HUB)) errors.push("missing IntegrationsHome");
else {
  const s = readFileSync(HUB, "utf8");
  if (!s.includes("OAuthRefreshHealthBoard")) errors.push("Board not wired into IntegrationsHome");
}
const ok = errors.length === 0;
console.log(`${ok ? "✅" : "❌"} reauth-visibility: ${errors.join("; ") || "wired"}`);
process.exit(ok ? 0 : 1);
