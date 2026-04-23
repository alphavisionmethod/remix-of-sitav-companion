import { handleCors, corsResponse, corsError } from "../_shared/cors.ts";
import { requireAuth } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const cors = handleCors(req);
  if (cors) return cors;

  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;
  const { user, supabase } = auth;

  const url = new URL(req.url);
  const action = url.searchParams.get("action") || "";
  const body = await req.json().catch(() => ({}));

  try {
    // PUSH — accept sync changes
    if (action === "push") {
      const { namespace, type, payload, device_id, content_hash } = body;
      if (!namespace || !type) return corsError("namespace and type required", 400);

      // Upsert sync object
      const { data: existing } = await supabase.from("cloud_sync_objects")
        .select("id, version")
        .eq("user_id", user.id).eq("namespace", namespace).eq("type", type)
        .maybeSingle();

      let syncObj;
      if (existing) {
        const newVersion = (existing.version || 0) + 1;
        const { data } = await supabase.from("cloud_sync_objects")
          .update({
            version: newVersion,
            metadata_json: payload || {},
            content_hash: content_hash || null,
            origin_device_id: device_id || null,
          })
          .eq("id", existing.id).select().single();
        syncObj = data;

        // Record change
        await supabase.from("cloud_sync_changes").insert({
          user_id: user.id,
          object_id: existing.id,
          change_type: "update",
          from_version: existing.version,
          to_version: newVersion,
          origin_device_id: device_id || null,
          payload: payload || {},
        });
      } else {
        const { data } = await supabase.from("cloud_sync_objects").insert({
          user_id: user.id,
          namespace,
          type,
          version: 1,
          metadata_json: payload || {},
          content_hash: content_hash || null,
          origin_device_id: device_id || null,
        }).select().single();
        syncObj = data;

        if (syncObj) {
          await supabase.from("cloud_sync_changes").insert({
            user_id: user.id,
            object_id: syncObj.id,
            change_type: "create",
            from_version: 0,
            to_version: 1,
            origin_device_id: device_id || null,
            payload: payload || {},
          });
        }
      }

      return corsResponse({ object: syncObj });
    }

    // PULL — get changes since checkpoint
    if (action === "pull") {
      const { device_id, namespace, since_change_id } = body;
      if (!device_id) return corsError("device_id required", 400);

      let query = supabase.from("cloud_sync_changes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })
        .limit(500);

      if (namespace) query = query.eq("object_id", namespace);

      // Get checkpoint
      const { data: checkpoint } = await supabase.from("cloud_sync_checkpoints")
        .select("last_change_id")
        .eq("user_id", user.id).eq("device_id", device_id)
        .eq("namespace", namespace || "default")
        .maybeSingle();

      if (checkpoint?.last_change_id || since_change_id) {
        const refId = since_change_id || checkpoint?.last_change_id;
        query = query.gt("id", refId);
      }

      const { data: changes } = await query;

      return corsResponse({
        changes: changes || [],
        checkpoint: checkpoint?.last_change_id || null,
      });
    }

    // CHECKPOINT — update device checkpoint
    if (action === "checkpoint") {
      const { device_id, last_change_id, namespace } = body;
      if (!device_id || !last_change_id) return corsError("device_id and last_change_id required", 400);

      await supabase.from("cloud_sync_checkpoints").upsert({
        user_id: user.id,
        device_id,
        last_change_id,
        namespace: namespace || "default",
      }, { onConflict: "user_id,device_id,namespace" });

      return corsResponse({ success: true });
    }

    // CONFLICTS — list user conflicts
    if (action === "conflicts") {
      const { data } = await supabase.from("cloud_conflicts")
        .select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      return corsResponse({ conflicts: data || [] });
    }

    // RESOLVE — resolve a conflict
    if (action === "resolve") {
      const { conflict_id, resolution } = body;
      if (!conflict_id || !resolution) return corsError("conflict_id and resolution required", 400);

      await supabase.from("cloud_conflicts").update({
        state: "resolved",
        strategy: resolution,
        resolved_at: new Date().toISOString(),
      }).eq("id", conflict_id).eq("user_id", user.id);

      return corsResponse({ success: true });
    }

    return corsError(`Unknown action: ${action}`, 400);
  } catch (err) {
    return corsError(err instanceof Error ? err.message : "Internal error", 500);
  }
});
