#!/usr/bin/env node
/* eslint-disable no-console */
// Stricter sibling of nova-runtime-sdk-naming: scoped only to user-facing surfaces.
import { execSync } from "node:child_process";
const SCOPE = ["src/pages/", "src/components/", "src/app/"];
let hits: string[] = [];
for (const dir of SCOPE) {
  try {
    const out = execSync(`grep -rln "Nova Kernel" ${dir} --include="*.tsx" --include="*.ts" 2>/dev/null || true`, { encoding: "utf-8" });
    out.split("\n").filter(Boolean).forEach(f => { if (!/\.test\.tsx?$/.test(f)) hits.push(f); });
  } catch {}
}
const ok = hits.length === 0;
console.log(`${ok ? "✅" : "❌"} no-user-visible-nova-kernel: ${hits.length} surfaces`);
hits.slice(0, 20).forEach(h => console.error(`   ${h}`));
process.exit(ok ? 0 : 1);
