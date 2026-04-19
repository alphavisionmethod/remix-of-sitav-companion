// Release Evidence Graph Snapshot — captures aggregator graph state.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { count: nodeCount } = await admin.from("evidence_graph_nodes").select("id", { count: "exact", head: true });
    const { count: edgeCount } = await admin.from("evidence_graph_edges").select("id", { count: "exact", head: true });

    const body = await req.json().catch(() => ({}));
    const release_tag = body?.release_tag ?? null;
    const manifest_count = Number(body?.manifest_count ?? 0);
    const evidence = body?.evidence ?? {};

    const coverage_pct = manifest_count > 0 ? Math.min(100, ((nodeCount ?? 0) / manifest_count) * 100) : 0;
    const graph_hash = await sha256Hex(JSON.stringify({ nodeCount, edgeCount, manifest_count, release_tag, t: Date.now() }));

    const { data, error } = await admin.from("release_evidence_graph_snapshots").insert({
      release_tag, node_count: nodeCount ?? 0, edge_count: edgeCount ?? 0,
      manifest_count, coverage_pct: Number(coverage_pct.toFixed(2)), graph_hash, evidence,
    }).select().single();
    if (error) throw error;
    return new Response(JSON.stringify({ ok: true, snapshot: data }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
