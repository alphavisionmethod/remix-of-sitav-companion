#!/usr/bin/env -S bun run
// ════════════════════════════════════════════════════════════
// SITA OS — Module Registry Manifest Emitter (Phase 1)
// ════════════════════════════════════════════════════════════
// Snapshots the DB-resident module_registry + route_ownership
// tables to a deterministic JSON artifact under public/generated/.
//
// Consumed by:
//   - check-module-registry-coverage.ts (CI gate that ensures every
//     route declared in the React Router is owned by a registered
//     module, without needing DB access at lint time).
//   - external embeds and audit tooling that need an offline view
//     of the module / route map.
//
// Auth: uses VITE_SUPABASE_URL + VITE_SUPABASE_PUBLISHABLE_KEY (anon),
// since module_registry and route_ownership are SELECT-readable to
// authenticated. In CI, set SUPABASE_SERVICE_ROLE_KEY to bypass the
// RLS authenticated-only requirement (needed because the CI job runs
// without an authenticated session).

import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

interface ModuleRow {
  module_id: string;
  parent_id: string | null;
  pillar: string;
  label: string;
  description: string | null;
  route_prefix: string | null;
  icon: string | null;
  category: string | null;
  feature_flag: string | null;
  lifecycle: string;
  default_authority_level: string;
  health_status: string;
  owner: string | null;
  sort_order: number;
  enabled: boolean;
}

interface RouteRow {
  route_path: string;
  module_id: string;
  is_shared: boolean;
  is_trust: boolean;
  visibility: string;
  lifecycle: string;
  notes: string | null;
}

interface Manifest {
  generatedAt: string;
  source: "public.module_registry + public.route_ownership";
  totals: {
    modules: number;
    routes: number;
    byPillar: Record<string, number>;
    byLifecycle: Record<string, number>;
  };
  modules: ModuleRow[];
  routes: RouteRow[];
}

const URL =
  process.env.SUPABASE_URL ??
  process.env.VITE_SUPABASE_URL ??
  "https://fctupowhcljejygjfpty.supabase.co";

const KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  process.env.SUPABASE_ANON_KEY;

if (!KEY) {
  console.error(
    "✗ emit-module-registry-manifest: missing SUPABASE_SERVICE_ROLE_KEY / VITE_SUPABASE_PUBLISHABLE_KEY",
  );
  process.exit(1);
}

async function fetchTable<T>(table: string, orderBy: string): Promise<T[]> {
  const url = `${URL}/rest/v1/${table}?select=*&order=${orderBy}`;
  const res = await fetch(url, {
    headers: {
      apikey: KEY!,
      Authorization: `Bearer ${KEY}`,
    },
  });
  if (!res.ok) {
    throw new Error(`fetch ${table} ${res.status}: ${await res.text()}`);
  }
  return (await res.json()) as T[];
}

async function main() {
  const [modules, routes] = await Promise.all([
    fetchTable<ModuleRow>("module_registry", "sort_order.asc"),
    fetchTable<RouteRow>("route_ownership", "route_path.asc"),
  ]);

  const byPillar: Record<string, number> = {};
  const byLifecycle: Record<string, number> = {};
  for (const m of modules) {
    byPillar[m.pillar] = (byPillar[m.pillar] ?? 0) + 1;
    byLifecycle[m.lifecycle] = (byLifecycle[m.lifecycle] ?? 0) + 1;
  }

  // Reproducible builds: honor SOURCE_DATE_EPOCH for byte-deterministic output.
  const epoch = process.env.SOURCE_DATE_EPOCH;
  const generatedAt = epoch
    ? new Date(Number(epoch) * 1000).toISOString()
    : new Date().toISOString();

  const manifest: Manifest = {
    generatedAt,
    source: "public.module_registry + public.route_ownership",
    totals: {
      modules: modules.length,
      routes: routes.length,
      byPillar,
      byLifecycle,
    },
    // Strip mutable / volatile fields for stability
    modules: modules.map((m) => ({
      module_id: m.module_id,
      parent_id: m.parent_id,
      pillar: m.pillar,
      label: m.label,
      description: m.description,
      route_prefix: m.route_prefix,
      icon: m.icon,
      category: m.category,
      feature_flag: m.feature_flag,
      lifecycle: m.lifecycle,
      default_authority_level: m.default_authority_level,
      health_status: m.health_status,
      owner: m.owner,
      sort_order: m.sort_order,
      enabled: m.enabled,
    })),
    routes: routes.map((r) => ({
      route_path: r.route_path,
      module_id: r.module_id,
      is_shared: r.is_shared,
      is_trust: r.is_trust,
      visibility: r.visibility,
      lifecycle: r.lifecycle,
      notes: r.notes,
    })),
  };

  const out = resolve("public/generated");
  mkdirSync(out, { recursive: true });
  const target = resolve(out, "module-registry.json");
  writeFileSync(target, JSON.stringify(manifest, null, 2) + "\n", "utf8");
  console.log(
    `✓ Wrote ${target} — ${manifest.totals.modules} modules, ${manifest.totals.routes} routes.`,
  );
}

main().catch((err) => {
  console.error("✗ emit-module-registry-manifest failed:", err);
  process.exit(1);
});