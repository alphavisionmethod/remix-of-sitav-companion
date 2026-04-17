/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// SITA OS — Phase 24.1.D
// snapshot-db-schema.ts
//
// Calls the SECURITY DEFINER RPC `get_db_truth_snapshot('schema')`
// and writes the live result to `generated/db-schema-snapshot.json`.
//
// Gate 35 (`check-domain-reality.ts`) requires this snapshot to be
// present and non-empty. If the snapshot is missing, Gate 35 FAILS
// (no silent fallback to "assumed present").
//
// Usage (CI):
//   SUPABASE_URL=...      \
//   SUPABASE_SERVICE_ROLE_KEY=... \
//   npx tsx scripts/architecture/snapshot-db-schema.ts
//
// The service role bypasses RLS but still satisfies the function's
// `has_role(...,'admin')` gate when invoked with an admin JWT — for
// CI we use the service role and call the underlying pg_catalog read
// via supabase-js (the RPC enforces admin gating at runtime; in CI
// we run as service role which is allowed by the platform).
// ═══════════════════════════════════════════════════════════════

import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";

const ROOT = process.cwd();
const OUT_PATH = join(ROOT, "generated/db-schema-snapshot.json");

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

interface SnapshotPayload {
  generatedAt: string;
  source: string;
  count: number;
  tables: Array<{
    tablename: string;
    rowsecurity?: boolean;
    hasindexes?: boolean;
    hastriggers?: boolean;
  }>;
}

async function fetchSnapshot(): Promise<SnapshotPayload> {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    throw new Error(
      "snapshot-db-schema requires SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY env vars",
    );
  }

  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_db_truth_snapshot`, {
    method: "POST",
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ _op: "schema" }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`get_db_truth_snapshot RPC failed (${res.status}): ${text}`);
  }

  const json = (await res.json()) as { tables?: SnapshotPayload["tables"]; count?: number };
  if (!Array.isArray(json.tables) || json.tables.length === 0) {
    throw new Error("RPC returned no tables — refusing to write empty snapshot");
  }

  return {
    generatedAt: new Date().toISOString(),
    source: "live get_db_truth_snapshot RPC",
    count: json.count ?? json.tables.length,
    tables: json.tables,
  };
}

async function main() {
  console.log("📸 Capturing live DB schema snapshot…");
  const snapshot = await fetchSnapshot();
  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, JSON.stringify(snapshot, null, 2));
  console.log(
    `✅ Wrote ${OUT_PATH} (${snapshot.count} tables, source: ${snapshot.source})`,
  );
}

main().catch((err) => {
  console.error("❌ snapshot-db-schema failed:", err.message ?? err);
  process.exit(1);
});
