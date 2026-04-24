// ═══════════════════════════════════════════════════════════════
// SELF-HEALING — Optional LLM narrative for root-cause clusters.
// CRITICAL: This is ANNOTATION ONLY. It NEVER influences the
// deterministic decision (lane, strategy, gate) — those are decided
// by the rule engine. The narrative is dropped into the cluster
// payload as `cluster.narrative` for human readability.
// ═══════════════════════════════════════════════════════════════
const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const DEFAULT_MODEL = "google/gemini-3-flash-preview";

function summarizeCluster(c) {
  return [
    `Class: ${c.class}`,
    `Anchor: ${c.anchor}`,
    `Severity: ${c.severity}`,
    `Symptoms: ${c.symptomCount}`,
    `Files (${c.impactedFiles?.length || 0}): ${(c.impactedFiles || []).slice(0, 8).join(", ")}`,
    `Owners: ${(c.impactedOwners || []).join(", ")}`,
  ].join("\n");
}

/**
 * Return a one-paragraph narrative for a cluster, or null if no API
 * key / network / disabled. Never throws — failure → null.
 */
export async function explainCluster(cluster, { model = DEFAULT_MODEL, apiKey = process.env.LOVABLE_API_KEY } = {}) {
  if (!apiKey) return null;
  if (process.env.SITA_HEAL_LLM === "0") return null;
  try {
    const resp = await fetch(GATEWAY, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content:
              "You explain CI/build failures for engineers. Two short sentences. " +
              "First: most likely cause. Second: smallest reasonable fix. " +
              "Never recommend touching files outside the impacted set. " +
              "If the class is on the refusal list, say 'Human review required.'",
          },
          { role: "user", content: summarizeCluster(cluster) },
        ],
        max_tokens: 180,
      }),
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    const txt = data?.choices?.[0]?.message?.content?.trim();
    return txt || null;
  } catch {
    return null;
  }
}

/** Annotate a clusters file in place (no decision impact). */
export async function annotateClustersFile(clustersPath) {
  const fs = await import("node:fs");
  const doc = JSON.parse(fs.readFileSync(clustersPath, "utf8"));
  if (process.env.SITA_HEAL_LLM !== "1") {
    doc.narrativeStatus = "disabled (set SITA_HEAL_LLM=1 to enable)";
    fs.writeFileSync(clustersPath, JSON.stringify(doc, null, 2));
    return { annotated: 0, total: doc.clusters.length, status: "disabled" };
  }
  let annotated = 0;
  for (const c of doc.clusters) {
    const n = await explainCluster(c);
    if (n) { c.narrative = n; annotated++; }
  }
  doc.narrativeStatus = `annotated:${annotated}/${doc.clusters.length}`;
  fs.writeFileSync(clustersPath, JSON.stringify(doc, null, 2));
  return { annotated, total: doc.clusters.length, status: "ok" };
}