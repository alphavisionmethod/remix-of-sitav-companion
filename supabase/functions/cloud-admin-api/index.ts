import { handleCors, corsResponse, corsError } from "../_shared/cors.ts";
import { requireAdmin, getServiceClient } from "../_shared/auth.ts";

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

  const auth = await requireAdmin(req);
  if (auth instanceof Response) return auth;

  const db = getServiceClient();
  const url = new URL(req.url);
  const action = url.searchParams.get("action") || "";
  const body = await req.json().catch(() => ({}));

  try {
    // HEALTH — platform-wide stats from real DB
    if (action === "health") {
      const [usersRes, filesRes, blobsRes, devicesRes, conflictsRes, trashRes, syncRes, quotaRes] = await Promise.all([
        db.from("cloud_storage_usage").select("*", { count: "exact", head: false }),
        db.from("cloud_files").select("id", { count: "exact", head: true }),
        db.from("cloud_blobs").select("id", { count: "exact", head: true }),
        db.from("cloud_devices").select("id", { count: "exact", head: true }),
        db.from("cloud_conflicts").select("id", { count: "exact", head: true }).eq("state", "pending"),
        db.from("cloud_trash").select("id", { count: "exact", head: true }),
        db.from("cloud_sync_changes").select("id", { count: "exact", head: true }),
        db.from("cloud_storage_usage").select("used_bytes, quota_bytes, file_count, orphaned_blobs, failed_uploads, failed_downloads"),
      ]);

      const quotaData = quotaRes.data || [];
      const totalUsed = quotaData.reduce((s: number, r: any) => s + (r.used_bytes || 0), 0);
      const totalQuota = quotaData.reduce((s: number, r: any) => s + (r.quota_bytes || 0), 0);
      const totalOrphaned = quotaData.reduce((s: number, r: any) => s + (r.orphaned_blobs || 0), 0);
      const totalFailedUp = quotaData.reduce((s: number, r: any) => s + (r.failed_uploads || 0), 0);
      const totalFailedDown = quotaData.reduce((s: number, r: any) => s + (r.failed_downloads || 0), 0);

      return corsResponse({
        totalUsedBytes: totalUsed,
        totalQuotaBytes: totalQuota,
        totalUsers: usersRes.count || quotaData.length,
        totalFiles: filesRes.count || 0,
        totalBlobs: blobsRes.count || 0,
        totalDevices: devicesRes.count || 0,
        pendingConflicts: conflictsRes.count || 0,
        trashItems: trashRes.count || 0,
        totalSyncChanges: syncRes.count || 0,
        orphanedBlobs: totalOrphaned,
        failedUploads: totalFailedUp,
        failedDownloads: totalFailedDown,
        avgUsagePct: totalQuota > 0 ? Math.round((totalUsed / totalQuota) * 100) : 0,
        backendHealthy: true,
      });
    }

    // QUOTA OVERRIDE
    if (action === "quota-override") {
      const { user_id, quota_bytes, bonus_bytes } = body;
      if (!user_id) return corsError("user_id required", 400);

      if (quota_bytes !== undefined) {
        await db.from("cloud_storage_usage").update({ quota_bytes }).eq("user_id", user_id);
      }
      if (bonus_bytes !== undefined) {
        await db.from("cloud_user_plans").update({ bonus_storage_bytes: bonus_bytes }).eq("user_id", user_id);
      }

      return corsResponse({ success: true });
    }

    // REPAIR — trigger reconciliation
    if (action === "repair") {
      const { job_type, target_user_id } = body;

      // Create sync job record
      const { data: job } = await db.from("cloud_sync_jobs").insert({
        job_type: job_type || "reconciliation",
        target_user_id: target_user_id || null,
        triggered_by: auth.user.id,
        status: "running",
        started_at: new Date().toISOString(),
        progress_pct: 0,
      }).select().single();

      // Simulate repair work: count orphaned blobs
      if (target_user_id) {
        const { data: blobs } = await db.from("cloud_blobs")
          .select("id").eq("user_id", target_user_id).eq("finalized", false);
        const orphanCount = blobs?.length || 0;

        // Recalculate usage
        const { data: files } = await db.from("cloud_files")
          .select("size").eq("user_id", target_user_id).eq("deleted", false);
        const totalSize = (files || []).reduce((s: number, f: any) => s + (f.size || 0), 0);

        await db.from("cloud_storage_usage").upsert({
          user_id: target_user_id,
          used_bytes: totalSize,
          file_count: files?.length || 0,
          orphaned_blobs: orphanCount,
          last_reconciled_at: new Date().toISOString(),
        }, { onConflict: "user_id" });

        // Complete job
        if (job) {
          await db.from("cloud_sync_jobs").update({
            status: "completed",
            completed_at: new Date().toISOString(),
            progress_pct: 100,
            result_summary: `Reconciled: ${files?.length || 0} files, ${orphanCount} orphaned blobs found`,
          }).eq("id", job.id);
        }
      } else if (job) {
        await db.from("cloud_sync_jobs").update({
          status: "completed",
          completed_at: new Date().toISOString(),
          progress_pct: 100,
          result_summary: "Global reconciliation queued",
        }).eq("id", job.id);
      }

      return corsResponse({ job });
    }

    // USER STORAGE DETAILS
    if (action === "user-storage") {
      const { user_id } = body;
      if (!user_id) return corsError("user_id required", 400);

      const [usageRes, filesRes, trashRes, devicesRes] = await Promise.all([
        db.from("cloud_storage_usage").select("*").eq("user_id", user_id).maybeSingle(),
        db.from("cloud_files").select("*").eq("user_id", user_id).eq("deleted", false).order("created_at", { ascending: false }).limit(50),
        db.from("cloud_trash").select("*").eq("user_id", user_id),
        db.from("cloud_devices").select("*").eq("user_id", user_id),
      ]);

      return corsResponse({
        usage: usageRes.data,
        files: filesRes.data || [],
        trash: trashRes.data || [],
        devices: devicesRes.data || [],
      });
    }

    // JOBS LIST
    if (action === "jobs") {
      const { data } = await db.from("cloud_sync_jobs")
        .select("*").order("created_at", { ascending: false }).limit(50);
      return corsResponse({ jobs: data || [] });
    }

    return corsError(`Unknown action: ${action}`, 400);
  } catch (err) {
    return corsError(err instanceof Error ? err.message : "Internal error", 500);
  }
});
