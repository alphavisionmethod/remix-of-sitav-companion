#!/usr/bin/env node
/* eslint-disable no-console */
import { existsSync, readFileSync } from "node:fs";
const RUNBOOK = "generated/final-hardening/BOARDROOM_FOLLOWTHROUGH_RUNBOOK.md";
const BOARD = "src/components/admin/boardroom/Layer7FollowthroughBoard.tsx";
const errors: string[] = [];
if (!existsSync(RUNBOOK)) errors.push("runbook missing");
if (!existsSync(BOARD)) errors.push("admin board missing");
if (existsSync(RUNBOOK)) {
  const s = readFileSync(RUNBOOK, "utf8");
  if (!/Layer7FollowthroughBoard|\/admin\/approvals/.test(s)) errors.push("runbook lacks admin surface link");
}
const ok = errors.length === 0;
console.log(`${ok ? "✅" : "❌"} boardroom-runbook-linkage: ${errors.join("; ") || "linked"}`);
process.exit(ok ? 0 : 1);
