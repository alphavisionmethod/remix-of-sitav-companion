// ═══════════════════════════════════════════════════════════════
// SITA OS — Cross-Advisor Consistency Check
//
// Nightly (or on-demand) scan that detects contradictions across
// advisors' open recommendations and writes findings into
// advisor_consistency_findings (RLS-scoped per user).
//
// Heuristics:
//   1. opposing_category    — same domain, different advisors,
//                             opposing categories (e.g. spend_increase
//                             vs spend_decrease).
//   2. timeline_contradiction — same domain, "accelerate" + "pause".
//   3. resource_conflict    — same domain, "hire" + "freeze".
//   4. mutual_exclusion     — explicit pair stored in metadata
//                             (`mutually_exclusive_with` array).
//
// Auth: service-role for cron; authenticated user for manual run
// (then scoped to that user only).
// ═══════════════════════════════════════════════════════════════
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface RecRow {
  id: string;
  user_id: string;
  advisor_id: string;
  title: string;
  summary: string;
  domain: string;
  category: string;
  status: string;
  metadata?: Record<string, unknown> | null;
}

interface FindingDraft {
  user_id: string;
  domain: string;
  finding_kind:
    | "opposing_category"
    | "timeline_contradiction"
    | "resource_conflict"
    | "mutual_exclusion";
  severity: "info" | "warn" | "critical";
  summary: string;
  advisor_a: string;
  advisor_b: string;
  recommendation_a_id: string;
  recommendation_b_id: string;
  evidence: Record<string, unknown>;
}

const OPPOSING_CATEGORY_PAIRS: ReadonlyArray<readonly [string, string, "warn" | "critical"]> = [
  ["spend_increase", "spend_decrease", "critical"],
  ["expansion", "contraction", "critical"],
  ["raise_price", "discount", "warn"],
] as const;

const TIMELINE_PAIRS: ReadonlyArray<readonly [string, string]> = [["accelerate", "pause"]];
const RESOURCE_PAIRS: ReadonlyArray<readonly [string, string]> = [["hire", "freeze"]];

function pairKey(a: string, b: string): string {
  return [a, b].sort().join("::");
}

function detectFindings(recs: RecRow[]): FindingDraft[] {
  const out: FindingDraft[] = [];
  const seen = new Set<string>();

  // Group by user + domain
  const byUserDomain = new Map<string, RecRow[]>();
  for (const r of recs) {
    if (r.status === "resolved") continue;
    const k = `${r.user_id}::${r.domain}`;
    const arr = byUserDomain.get(k) ?? [];
    arr.push(r);
    byUserDomain.set(k, arr);
  }

  for (const list of byUserDomain.values()) {
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const a = list[i];
        const b = list[j];
        if (a.advisor_id === b.advisor_id) continue;

        // 1. opposing_category
        for (const [catA, catB, sev] of OPPOSING_CATEGORY_PAIRS) {
          const matchAB = a.category === catA && b.category === catB;
          const matchBA = a.category === catB && b.category === catA;
          if (matchAB || matchBA) {
            const k = pairKey(a.id, b.id) + "::opposing_category";
            if (seen.has(k)) continue;
            seen.add(k);
            out.push({
              user_id: a.user_id,
              domain: a.domain,
              finding_kind: "opposing_category",
              severity: sev,
              summary: `${a.advisor_id} (${a.category}) contradicts ${b.advisor_id} (${b.category}) in ${a.domain}.`,
              advisor_a: a.advisor_id,
              advisor_b: b.advisor_id,
              recommendation_a_id: a.id,
              recommendation_b_id: b.id,
              evidence: {
                rule: "opposing_category",
                pair: `${catA}↔${catB}`,
                titles: [a.title, b.title],
              },
            });
          }
        }

        // 2. timeline_contradiction
        for (const [catA, catB] of TIMELINE_PAIRS) {
          const matchAB = a.category === catA && b.category === catB;
          const matchBA = a.category === catB && b.category === catA;
          if (matchAB || matchBA) {
            const k = pairKey(a.id, b.id) + "::timeline_contradiction";
            if (seen.has(k)) continue;
            seen.add(k);
            out.push({
              user_id: a.user_id,
              domain: a.domain,
              finding_kind: "timeline_contradiction",
              severity: "warn",
              summary: `${a.advisor_id} wants to ${a.category} while ${b.advisor_id} wants to ${b.category} in ${a.domain}.`,
              advisor_a: a.advisor_id,
              advisor_b: b.advisor_id,
              recommendation_a_id: a.id,
              recommendation_b_id: b.id,
              evidence: { rule: "timeline_contradiction", pair: `${catA}↔${catB}` },
            });
          }
        }

        // 3. resource_conflict
        for (const [catA, catB] of RESOURCE_PAIRS) {
          const matchAB = a.category === catA && b.category === catB;
          const matchBA = a.category === catB && b.category === catA;
          if (matchAB || matchBA) {
            const k = pairKey(a.id, b.id) + "::resource_conflict";
            if (seen.has(k)) continue;
            seen.add(k);
            out.push({
              user_id: a.user_id,
              domain: a.domain,
              finding_kind: "resource_conflict",
              severity: "critical",
              summary: `Headcount conflict in ${a.domain}: ${a.advisor_id} → ${a.category} vs ${b.advisor_id} → ${b.category}.`,
              advisor_a: a.advisor_id,
              advisor_b: b.advisor_id,
              recommendation_a_id: a.id,
              recommendation_b_id: b.id,
              evidence: { rule: "resource_conflict", pair: `${catA}↔${catB}` },
            });
          }
        }

        // 4. mutual_exclusion via metadata.mutually_exclusive_with
        const aExcl = Array.isArray(a.metadata?.mutually_exclusive_with)
          ? (a.metadata!.mutually_exclusive_with as string[])
          : [];
        const bExcl = Array.isArray(b.metadata?.mutually_exclusive_with)
          ? (b.metadata!.mutually_exclusive_with as string[])
          : [];
        if (aExcl.includes(b.id) || bExcl.includes(a.id)) {
          const k = pairKey(a.id, b.id) + "::mutual_exclusion";
          if (seen.has(k)) continue;
          seen.add(k);
          out.push({
            user_id: a.user_id,
            domain: a.domain,
            finding_kind: "mutual_exclusion",
            severity: "critical",
            summary: `Explicitly mutually-exclusive recommendations from ${a.advisor_id} and ${b.advisor_id}.`,
            advisor_a: a.advisor_id,
            advisor_b: b.advisor_id,
            recommendation_a_id: a.id,
            recommendation_b_id: b.id,
            evidence: { rule: "mutual_exclusion" },
          });
        }
      }
    }
  }

  return out;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

  const runId = `cac-${new Date().toISOString().replace(/[:.]/g, "-")}`;
  let scopedUserId: string | null = null;
  let triggeredBy: "cron" | "manual" = "cron";

  // Detect manual trigger from authenticated user
  const authHeader = req.headers.get("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const userClient = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: authHeader } },
        auth: { persistSession: false },
      });
      const { data: u } = await userClient.auth.getUser();
      if (u?.user?.id) {
        scopedUserId = u.user.id;
        triggeredBy = "manual";
      }
    } catch {
      /* ignore — fall back to cron */
    }
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  // Pull open recommendations
  let q = supabase
    .from("advisor_board_recommendations")
    .select("id, user_id, advisor_id, title, summary, domain, category, status, metadata")
    .neq("status", "resolved")
    .limit(5000);
  if (scopedUserId) q = q.eq("user_id", scopedUserId);

  const { data: recs, error: recErr } = await q;
  if (recErr) {
    console.error("cross-advisor-consistency-check: failed to read recs", recErr);
    return new Response(
      JSON.stringify({ error: "Failed to read recommendations", detail: recErr.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const findings = detectFindings((recs ?? []) as RecRow[]);

  // Resolve findings whose recommendations no longer match (recs changed since last run)
  // For the in-scope user(s), close any "open" finding whose two recs are no longer both open.
  const openRecIds = new Set((recs ?? []).map((r) => r.id));
  const findingPairsThisRun = new Set(
    findings.map((f) => `${f.recommendation_a_id}::${f.recommendation_b_id}::${f.finding_kind}`),
  );

  let staleClosed = 0;
  {
    let staleQ = supabase
      .from("advisor_consistency_findings")
      .select("id, recommendation_a_id, recommendation_b_id, finding_kind, user_id")
      .eq("status", "open");
    if (scopedUserId) staleQ = staleQ.eq("user_id", scopedUserId);
    const { data: openFindings } = await staleQ;
    const staleIds: string[] = [];
    for (const f of openFindings ?? []) {
      const k = `${f.recommendation_a_id}::${f.recommendation_b_id}::${f.finding_kind}`;
      const stillContradicts =
        findingPairsThisRun.has(k) ||
        (openRecIds.has(f.recommendation_a_id) && openRecIds.has(f.recommendation_b_id) && !scopedUserId);
      if (!stillContradicts) staleIds.push(f.id);
    }
    if (staleIds.length > 0) {
      const { error: closeErr } = await supabase
        .from("advisor_consistency_findings")
        .update({ status: "resolved", resolved_at: new Date().toISOString(), resolution_notes: "auto-resolved: contradiction no longer present" })
        .in("id", staleIds);
      if (!closeErr) staleClosed = staleIds.length;
    }
  }

  // Insert new findings (idempotent via unique partial index)
  let inserted = 0;
  let skipped = 0;
  for (const f of findings) {
    const { error: insErr } = await supabase
      .from("advisor_consistency_findings")
      .insert({ ...f, run_id: runId });
    if (insErr) {
      // 23505 = unique violation → already an open finding, expected
      if ((insErr as { code?: string }).code === "23505") skipped++;
      else console.error("insert finding failed", insErr);
    } else {
      inserted++;
    }
  }

  return new Response(
    JSON.stringify({
      ok: true,
      run_id: runId,
      triggered_by: triggeredBy,
      scope: scopedUserId ? "user" : "all",
      recommendations_scanned: recs?.length ?? 0,
      findings_detected: findings.length,
      findings_inserted: inserted,
      findings_skipped_existing: skipped,
      stale_findings_closed: staleClosed,
    }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});