#!/usr/bin/env node
/* eslint-disable no-console */
import { existsSync, readFileSync } from "node:fs";
const F = "generated/restore-and-oauth-hardening/post-restore-verification-matrix.json";
if (!existsSync(F)) { console.error("❌ matrix missing"); process.exit(1); }
const m = JSON.parse(readFileSync(F, "utf-8"));
const r = m.checks?.critical_routes;
const ok = r?.status === "pass" && (r?.failingRoutes?.length ?? 0) === 0;
console.log(`${ok ? "✅" : "❌"} post-restore-routes: tested=${r?.routesTested ?? 0} failing=${r?.failingRoutes?.length ?? 0}`);
process.exit(ok ? 0 : 1);
