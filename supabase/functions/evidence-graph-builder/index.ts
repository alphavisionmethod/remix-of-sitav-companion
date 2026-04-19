// Evidence Graph Builder — populates evidence_graph_nodes/edges from
// generated/manifest-registry.json and validator outputs. Service-role only.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

interface ManifestEntry {
  id: string;
  owner?: string;
  source?: string;
  validator?: string;
  gate?: string;
  consumers?: string[];
}

interface BuildRequest {
  manifests?: ManifestEntry[];
  release_id?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    if (!serviceKey || !supabaseUrl) {
      return new Response(JSON.stringify({ error: "service config missing" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body: BuildRequest = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const manifests = Array.isArray(body.manifests) ? body.manifests : [];
    const releaseId = body.release_id ?? `release-${new Date().toISOString().slice(0, 10)}`;

    const supabase = createClient(supabaseUrl, serviceKey);

    let nodesCreated = 0;
    let edgesCreated = 0;
    const nodeIdByRef = new Map<string, string>();

    // Upsert manifest nodes
    for (const m of manifests) {
      if (!m.id) continue;
      const { data, error } = await supabase
        .from("evidence_graph_nodes")
        .upsert(
          {
            kind: "manifest",
            ref: m.id,
            owner: m.owner ?? "platform",
            metadata: { source: m.source, gate: m.gate },
          },
          { onConflict: "kind,ref" },
        )
        .select("id")
        .single();
      if (!error && data) {
        nodeIdByRef.set(`manifest:${m.id}`, data.id);
        nodesCreated++;
      }
    }

    // Upsert validator nodes + edges (manifest -[validated_by]-> validator)
    for (const m of manifests) {
      if (!m.id || !m.validator) continue;
      const { data: vData, error: vErr } = await supabase
        .from("evidence_graph_nodes")
        .upsert(
          {
            kind: "validator",
            ref: m.validator,
            owner: m.owner ?? "platform",
            metadata: { gate: m.gate },
          },
          { onConflict: "kind,ref" },
        )
        .select("id")
        .single();
      if (!vErr && vData) {
        nodeIdByRef.set(`validator:${m.validator}`, vData.id);
        nodesCreated++;
        const fromId = nodeIdByRef.get(`manifest:${m.id}`);
        if (fromId) {
          const { error: eErr } = await supabase
            .from("evidence_graph_edges")
            .upsert(
              { from_node: fromId, to_node: vData.id, relation: "validated_by" },
              { onConflict: "from_node,to_node,relation" },
            );
          if (!eErr) edgesCreated++;
        }
      }
    }

    // Record a release-scoped summary node
    await supabase.from("evidence_graph_nodes").upsert(
      {
        kind: "release",
        ref: releaseId,
        owner: "release-aggregator",
        metadata: {
          built_at: new Date().toISOString(),
          manifests_processed: manifests.length,
          nodes_created: nodesCreated,
          edges_created: edgesCreated,
        },
      },
      { onConflict: "kind,ref" },
    );

    return new Response(
      JSON.stringify({
        ok: true,
        release_id: releaseId,
        manifests_processed: manifests.length,
        nodes_created: nodesCreated,
        edges_created: edgesCreated,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
