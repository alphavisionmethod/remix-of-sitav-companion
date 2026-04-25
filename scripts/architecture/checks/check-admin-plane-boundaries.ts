#!/usr/bin/env tsx
// Discovery shim — canonical: scripts/architecture/check-admin-plane-boundaries.ts
import { spawnSync } from "node:child_process";
import { join } from "node:path";
const r = spawnSync("npx", ["tsx", join(process.cwd(), "scripts/architecture/check-admin-plane-boundaries.ts"), ...process.argv.slice(2)], { stdio: "inherit", shell: process.platform === "win32" });
process.exit(r.status ?? 1);
