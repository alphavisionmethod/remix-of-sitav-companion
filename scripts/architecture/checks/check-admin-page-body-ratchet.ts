#!/usr/bin/env tsx
// Discovery shim — canonical: scripts/architecture/check-admin-page-body-ratchet.ts
import { spawnSync } from "node:child_process";
import { join } from "node:path";
const r = spawnSync("npx", ["tsx", join(process.cwd(), "scripts/architecture/check-admin-page-body-ratchet.ts"), ...process.argv.slice(2)], { stdio: "inherit", shell: process.platform === "win32" });
process.exit(r.status ?? 1);
