// SITA OS — Update Manifest Server
//
// GET /functions/v1/os-update-manifest?channel=stable&current=1.0.0&device=<id>
//
// Returns the latest signed release manifest for the requested channel.
// Powers the on-device sita-updated agent.
//
// Response shape:
// {
//   version, channel, mandatory, released_at, notes,
//   artifacts: {
//     rootfs:  { url, sha256, size_bytes },
//     verity:  { url, roothash },
//     kernel:  { url, sha256, version }
//   },
//   signature: "<base64>",
//   pcr_policy: { 0: "...", 4: "...", 7: "..." }
// }

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-sita-device, x-sita-channel, x-sita-current",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

const ALLOWED_CHANNELS = new Set(["dev", "beta", "stable"]);

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const channel = (url.searchParams.get("channel") ?? req.headers.get("x-sita-channel") ?? "stable").toLowerCase();
    const current = url.searchParams.get("current") ?? req.headers.get("x-sita-current") ?? "0.0.0";
    const deviceId = url.searchParams.get("device") ?? req.headers.get("x-sita-device") ?? "anonymous";

    if (!ALLOWED_CHANNELS.has(channel)) {
      return json({ error: "invalid_channel", allowed: [...ALLOWED_CHANNELS] }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Latest non-yanked rootfs artifact for this channel
    const { data: rows, error } = await supabase
      .from("release_artifacts")
      .select("*")
      .eq("component", "sita-os-rootfs")
      .eq("channel", channel)
      .eq("is_yanked", false)
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) throw error;
    if (!rows || rows.length === 0) {
      return json({ error: "no_release", channel }, 404);
    }

    const rootfs = rows[0];
    if (compareVersions(rootfs.version, current) <= 0) {
      return json({ status: "up_to_date", current, latest: rootfs.version }, 200);
    }

    // Companion verity + kernel artifacts
    const { data: companions } = await supabase
      .from("release_artifacts")
      .select("*")
      .eq("version", rootfs.version)
      .eq("channel", channel)
      .in("component", ["sita-os-verity", "sita-os-kernel"]);

    const verity = companions?.find((c) => c.component === "sita-os-verity");
    const kernel = companions?.find((c) => c.component === "sita-os-kernel");

    // Audit the request (best-effort)
    await supabase.from("admin_action_audit").insert({
      action: "os.update.manifest_served",
      actor_user_id: "00000000-0000-0000-0000-000000000000",
      target_type: "os_release",
      target_id: rootfs.id,
      severity: "info",
      plane: "shared_service",
      metadata: { device_id: deviceId, channel, from: current, to: rootfs.version },
    });

    return json({
      status: "update_available",
      version: rootfs.version,
      channel,
      mandatory: rootfs.metadata?.mandatory === true,
      released_at: rootfs.created_at,
      notes: rootfs.release_notes ?? "",
      artifacts: {
        rootfs: {
          url: rootfs.download_url,
          sha256: rootfs.hash,
          size_bytes: rootfs.size_bytes,
        },
        verity: verity
          ? { url: verity.download_url, roothash: verity.hash }
          : null,
        kernel: kernel
          ? { url: kernel.download_url, sha256: kernel.hash, version: kernel.version }
          : null,
      },
      signature: rootfs.signature,
      pcr_policy: rootfs.metadata?.pcr_policy ?? null,
    }, 200);
  } catch (e) {
    console.error("[os-update-manifest] error:", e);
    return json({ error: "internal", message: String(e instanceof Error ? e.message : e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function compareVersions(a: string, b: string): number {
  const pa = a.split(/[.-]/).map((n) => Number.parseInt(n, 10) || 0);
  const pb = b.split(/[.-]/).map((n) => Number.parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] || 0) - (pb[i] || 0);
    if (d !== 0) return d;
  }
  return 0;
}
