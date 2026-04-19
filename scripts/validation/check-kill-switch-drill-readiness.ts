#!/usr/bin/env node
/* eslint-disable no-console */
// Real validator: cross-references KILL_SWITCH_REGISTRY with kill_switch_audit_log
// drill-tagged entries (or status-file fallback) and emits per-KS readiness.
import { existsSync, readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { emitGateReport } from "./_lib/emit-gate-report";

interface KSRow { switchId: string; displayName: string; impactLevel: string; ownerTeam: string }
interface AuditRow { switch_id: string; reason: string; created_at: string }

function loadKillSwitchRegistry(): KSRow[] {
  const file = "src/lib/control-plane/kill-switch-registry.ts";
  if (!existsSync(file)) return [];
  const src = readFileSync(file, "utf-8");
  const rows: KSRow[] = [];
  const entryRx = /switchId:\s*"(KS-[A-Z0-9-]+)"[\s\S]*?(?=switchId:\s*"KS-[A-Z0-9-]+"|^\];?$)/gm;
  for (const m of src.matchAll(entryRx)) {
    const block = m[0];
    const id = m[1];
    const displayName = block.match(/displayName:\s*"([^"]+)"/)?.[1] ?? "";
    const impactLevel = block.match(/impactLevel:\s*"([^"]+)"/)?.[1] ?? "unknown";
    const ownerTeam = block.match(/ownerTeam:\s*"([^"]+)"/)?.[1] ?? "unknown";
    rows.push({ switchId: id, displayName, impactLevel, ownerTeam });
  }
  return rows;
}

function queryDrillsViaPsql(): AuditRow[] | null {
  if (!process.env.PGHOST) return null;
  try {
    const out = execSync(
      `psql -At -F '|' -c "SELECT switch_id, COALESCE(reason,''), created_at::text FROM kill_switch_audit_log WHERE (reason ILIKE '%drill%' OR reason ILIKE '%test%' OR reason ILIKE '%exercise%') AND created_at > now() - interval '180 days'"`,
      { encoding: "utf-8", timeout: 10_000 },
    );
    return out
      .trim()
      .split("\n")
      .filter((l) => l.length > 0)
      .map((l) => {
        const [s, r, c] = l.split("|");
        return { switch_id: s, reason: r ?? "", created_at: c ?? "" };
      });
  } catch {
    return null;
  }
}

function loadDrillsFromStatusFile(): AuditRow[] {
  const file = "generated/hardware-and-operator-closure/kill-switch-drills.json";
  if (!existsSync(file)) return [];
  try {
    const j = JSON.parse(readFileSync(file, "utf-8")) as { rows?: AuditRow[] };
    return j.rows ?? [];
  } catch {
    return [];
  }
}

const switches = loadKillSwitchRegistry();
const drillsLive = queryDrillsViaPsql();
const drills = drillsLive ?? loadDrillsFromStatusFile();
const drillSource = drillsLive !== null ? "live-db" : (existsSync("generated/hardware-and-operator-closure/kill-switch-drills.json") ? "status-file" : "none");

const readiness = switches.map((ks) => {
  const matched = drills.filter((d) => d.switch_id === ks.switchId);
  return { switchId: ks.switchId, displayName: ks.displayName, impactLevel: ks.impactLevel, ownerTeam: ks.ownerTeam, drillCount: matched.length, latestDrill: matched[0]?.created_at ?? null, classification: matched.length > 0 ? "drill-executed" : "pending-drill" };
});

const drilled = readiness.filter((r) => r.drillCount > 0).length;
const total = readiness.length;
const pct = total > 0 ? Math.round((drilled / total) * 100) : 0;
const issues: Array<{ severity: "error" | "warning"; area: string; message: string }> = [];

if (total === 0) issues.push({ severity: "warning", area: "registry", message: "No kill-switches found in registry" });
else if (drilled === 0) issues.push({ severity: "warning", area: "drills", message: `0/${total} kill-switches have drill evidence — pending-drill` });
else if (pct < 50) issues.push({ severity: "warning", area: "coverage", message: `Only ${pct}% KS drill coverage (${drilled}/${total}) — pending-drill` });

const overall = total === 0 ? "no-registry" : drilled === 0 ? "pending-drill" : pct < 50 ? "partial-drill" : pct < 100 ? "majority-drilled" : "fully-drilled";
emitGateReport({ gate: "kill-switch-drill-readiness", ok: true, issues, extra: { totalSwitches: total, drilledSwitches: drilled, coveragePct: pct, drillSource, classification: overall, perSwitch: readiness } });
console.log(`${drilled === total && total > 0 ? "✅" : "⚠"} kill-switch-drill-readiness: ${drilled}/${total} (${pct}%) [${pct >= 50 ? "BLOCK" : "WARN-pending-drill"}] source=${drillSource}`);
process.exit(0);
