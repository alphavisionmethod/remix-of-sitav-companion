#!/usr/bin/env node
// SITA OS — Full Service Consolidation Sweep
const { execSync } = require("child_process");
try { execSync("node scripts/consolidate-services.js", { stdio: "inherit" }); } catch { process.exit(1); }
