// ═══════════════════════════════════════════════════════════════
// SITA OS — internal-agent-dependency-scanner (Phase 3D)
//
// Ingests REAL `npm audit --json` output (or compatible normalized
// findings) and:
//   1. Normalizes to dependency_upgrade_findings rows
//   2. For severity >= moderate → emits an ai_implementation_suggestion
//      via propose_implementation_suggestion (idempotent on advisory id)
//   3. Links the finding row to its suggestion
//
// REFUSES TO RUN WITHOUT REAL INPUT — no fake samples are ever emitted.
//
// Service-role only. CI/cron uploader posts:
//   POST /internal-agent-dependency-scanner
//   { "audit_json": <full npm audit --json output> }
// or:
//   { "findings": [{ package_name, current_version, target_version,
//                    severity, advisory_id, ecosystem, source_evidence }] }
// ═══════════════════════════════════════════════════════════════
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

interface NormalizedFinding {
  package_name: string;
  ecosystem: string;
  current_version: string | null;
  target_version: string | null;
  issue_class: "vulnerability" | "outdated" | "deprecated" | "license" | "maintenance";
  severity: "low" | "moderate" | "high" | "critical";
  advisory_id: string;
  source_evidence: Record<string, unknown>;
  suggested_action: string;
  upgrade_risk: "low" | "medium" | "high" | "breaking" | "unknown";
}

function normalizeNpmAudit(audit: any): NormalizedFinding[] {
  const out: NormalizedFinding[] = [];
  if (!audit || typeof audit !== "object") return out;

  // npm v7+ shape: { vulnerabilities: { [pkg]: { name, severity, via: [{source,name,...}], range, fixAvailable } } }
  const vulns = audit.vulnerabilities ?? {};
  for (const [pkg, vRaw] of Object.entries(vulns)) {
    const v: any = vRaw;
    const severity = String(v?.severity ?? "low").toLowerCase();
    if (!["low", "moderate", "high", "critical"].includes(severity)) continue;
    const via = Array.isArray(v?.via) ? v.via : [];
    const advisorySrc = via.find((x: any) => x && typeof x === "object" && (x.source || x.url));
    const advId = String(advisorySrc?.source ?? advisorySrc?.url ?? `${pkg}-${v?.range ?? "unknown"}`);
    const fixAvail = v?.fixAvailable;
    const target = typeof fixAvail === "object" && fixAvail?.version ? String(fixAvail.version) : null;
    out.push({
      package_name: pkg,
      ecosystem: "npm",
      current_version: v?.range ?? null,
      target_version: target,
      issue_class: "vulnerability",
      severity: severity as NormalizedFinding["severity"],
      advisory_id: advId,
      source_evidence: { via, range: v?.range, nodes: v?.nodes, effects: v?.effects },
      suggested_action: target
        ? `Upgrade ${pkg} to ${target}.`
        : `Investigate ${pkg} ${v?.range ?? ""} — no auto-fix available.`,
      upgrade_risk: typeof fixAvail === "object" && fixAvail?.isSemVerMajor ? "breaking" : "low",
    });
  }
  // npm v6 shape: { advisories: { id: { module_name, severity, ... } } }
  const advisories = audit.advisories ?? {};
  for (const [advId, aRaw] of Object.entries(advisories)) {
    const a: any = aRaw;
    const severity = String(a?.severity ?? "low").toLowerCase();
    if (!["low", "moderate", "high", "critical"].includes(severity)) continue;
    out.push({
      package_name: String(a?.module_name ?? "unknown"),
      ecosystem: "npm",
      current_version: a?.findings?.[0]?.version ?? null,
      target_version: a?.patched_versions ?? null,
      issue_class: "vulnerability",
      severity: severity as NormalizedFinding["severity"],
      advisory_id: String(advId),
      source_evidence: { url: a?.url, title: a?.title, cwe: a?.cwe },
      suggested_action: a?.recommendation ?? `Upgrade ${a?.module_name ?? "package"}.`,
      upgrade_risk: "unknown",
    });
  }
  return out;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!SUPABASE_URL || !SERVICE_KEY) {
    return jsonResponse({ ok: false, error: "missing service-role env" }, 500);
  }
  const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

  let body: any = {};
  try { body = await req.json(); } catch {
    return jsonResponse({ ok: false, error: "request body required (audit_json or findings)" }, 400);
  }

  // ── Refuse to run without real input ────────────────────────
  let findings: NormalizedFinding[] = [];
  if (Array.isArray(body?.findings) && body.findings.length > 0) {
    findings = body.findings as NormalizedFinding[];
  } else if (body?.audit_json && typeof body.audit_json === "object") {
    findings = normalizeNpmAudit(body.audit_json);
  } else {
    return jsonResponse({
      ok: false,
      error: "no real audit input provided — refuses to run without `audit_json` (npm audit --json) or pre-normalized `findings` array",
    }, 400);
  }

  if (findings.length === 0) {
    return jsonResponse({
      ok: true,
      message: "No vulnerabilities found in real input",
      findings_persisted: 0,
      suggestions_proposed: 0,
    });
  }

  let persisted = 0;
  let proposed = 0;
  const errors: string[] = [];
  const details: Array<{ package: string; advisory_id: string; finding_id?: string; suggestion_id?: string; error?: string }> = [];

  for (const f of findings) {
    // 1. Upsert finding row (idempotent on package+ecosystem+advisory+current_version)
    const { data: findingRow, error: findErr } = await admin
      .from("dependency_upgrade_findings")
      .upsert({
        package_name: f.package_name,
        ecosystem: f.ecosystem,
        current_version: f.current_version,
        target_version: f.target_version,
        issue_class: f.issue_class,
        severity: f.severity,
        advisory_id: f.advisory_id,
        source_evidence: f.source_evidence,
        suggested_action: f.suggested_action,
        upgrade_risk: f.upgrade_risk,
        status: "open",
        scanned_at: new Date().toISOString(),
      }, { onConflict: "package_name,ecosystem,advisory_id,current_version" })
      .select("id")
      .single();

    if (findErr) {
      errors.push(`finding ${f.package_name}/${f.advisory_id}: ${findErr.message}`);
      details.push({ package: f.package_name, advisory_id: f.advisory_id, error: findErr.message });
      continue;
    }
    persisted++;

    // 2. Only propose suggestions for moderate+ severity
    if (!["moderate", "high", "critical"].includes(f.severity)) {
      details.push({ package: f.package_name, advisory_id: f.advisory_id, finding_id: findingRow?.id });
      continue;
    }

    const priority: "urgent" | "high" | "normal" =
      f.severity === "critical" ? "urgent" : f.severity === "high" ? "high" : "normal";

    const { data: sugId, error: propErr } = await admin.rpc("propose_implementation_suggestion", {
      p_source_agent_id: "ar-architecture-truth",
      p_source_council: "architecture-governance",
      p_source_signal_type: "dependency_advisory",
      p_source_signal_ref: `npm-advisory:${f.advisory_id}:${f.package_name}`,
      p_title: `[${f.severity}] Upgrade ${f.package_name}${f.target_version ? ` → ${f.target_version}` : ""}`,
      p_summary: f.suggested_action,
      p_rationale: `${f.ecosystem} advisory ${f.advisory_id}. Current range: ${f.current_version ?? "unknown"}. Upgrade risk: ${f.upgrade_risk}.`,
      p_evidence_refs: [
        { kind: "dependency_finding", finding_id: findingRow?.id, advisory_id: f.advisory_id, severity: f.severity },
      ],
      p_proposed_change_type: "dependency_upgrade",
      p_estimated_effort: f.upgrade_risk === "breaking" ? "m" : "xs",
      p_expected_value: f.severity === "critical" ? "critical" : "high",
      p_priority: priority,
    });

    if (propErr) {
      errors.push(`propose ${f.package_name}: ${propErr.message}`);
      details.push({ package: f.package_name, advisory_id: f.advisory_id, finding_id: findingRow?.id, error: propErr.message });
      continue;
    }
    proposed++;

    // 3. Link finding → suggestion
    if (sugId && findingRow?.id) {
      await admin
        .from("dependency_upgrade_findings")
        .update({ related_suggestion_id: sugId, status: "linked", updated_at: new Date().toISOString() })
        .eq("id", findingRow.id);
    }
    details.push({ package: f.package_name, advisory_id: f.advisory_id, finding_id: findingRow?.id, suggestion_id: sugId as string });
  }

  return jsonResponse({
    ok: errors.length === 0,
    findings_input: findings.length,
    findings_persisted: persisted,
    suggestions_proposed: proposed,
    errors,
    details: details.slice(0, 50),
  });
});
