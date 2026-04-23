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

  try {
    // LIST files/folders
    if (req.method === "GET" || action === "list") {
      const folderId = url.searchParams.get("folder_id") || null;

      const [foldersRes, filesRes] = await Promise.all([
        supabase.from("cloud_folders").select("*").eq("user_id", user.id)
          .eq("parent_id", folderId).order("name"),
        supabase.from("cloud_files").select("*").eq("user_id", user.id)
          .eq("folder_id", folderId).eq("deleted", false).order("name"),
      ]);

      // Get quota
      const { data: quota } = await supabase.from("cloud_storage_usage")
        .select("*").eq("user_id", user.id).maybeSingle();

      return corsResponse({
        folders: foldersRes.data || [],
        files: filesRes.data || [],
        quota: quota || { used_bytes: 0, quota_bytes: 5_368_709_120, file_count: 0 },
      });
    }

    const body = await req.json().catch(() => ({}));

    // CREATE FOLDER
    if (action === "create-folder") {
      const { name, parent_id } = body;
      if (!name) return corsError("name required", 400);

      const parentPath = parent_id
        ? (await supabase.from("cloud_folders").select("path_cache").eq("id", parent_id).single()).data?.path_cache || "/"
        : "/";

      const { data, error } = await supabase.from("cloud_folders").insert({
        user_id: user.id,
        parent_id: parent_id || null,
        name,
        path_cache: `${parentPath}${name}/`,
      }).select().single();

      if (error) return corsError(error.message, 500);
      return corsResponse({ folder: data });
    }

    // UPLOAD INIT — allocate blob, check quota
    if (action === "upload-init") {
      const { file_name, file_size, mime_type, folder_id, checksum } = body;
      if (!file_name || !file_size) return corsError("file_name and file_size required", 400);

      // Check quota
      const { data: quota } = await supabase.from("cloud_storage_usage")
        .select("used_bytes, quota_bytes").eq("user_id", user.id).maybeSingle();

      const usedBytes = quota?.used_bytes || 0;
      const quotaBytes = quota?.quota_bytes || 5_368_709_120;
      if (usedBytes + file_size > quotaBytes) {
        return corsError("Quota exceeded", 413);
      }

      // Create blob record
      const ext = file_name.split(".").pop() || "bin";
      const safeName = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
      const storageKey = `${user.id}/${safeName}`;

      const { data: blob, error: blobErr } = await supabase.from("cloud_blobs").insert({
        user_id: user.id,
        storage_key: storageKey,
        size: file_size,
        checksum: checksum || null,
        finalized: false,
      }).select().single();

      if (blobErr) return corsError(blobErr.message, 500);

      // Reserve quota
      await supabase.from("cloud_storage_usage").upsert({
        user_id: user.id,
        used_bytes: usedBytes + file_size,
        file_count: (quota as any)?.file_count ? (quota as any).file_count + 1 : 1,
        quota_bytes: quotaBytes,
      }, { onConflict: "user_id" });

      return corsResponse({
        blob_id: blob.id,
        storage_key: storageKey,
        upload_path: storageKey,
      });
    }

    // UPLOAD FINALIZE — commit file metadata
    if (action === "upload-finalize") {
      const { blob_id, file_name, folder_id, mime_type, checksum } = body;
      if (!blob_id || !file_name) return corsError("blob_id and file_name required", 400);

      // Mark blob finalized
      const { data: blob } = await supabase.from("cloud_blobs")
        .update({ finalized: true, checksum: checksum || null })
        .eq("id", blob_id).eq("user_id", user.id).select().single();

      if (!blob) return corsError("Blob not found", 404);

      // Create file record
      const { data: file, error } = await supabase.from("cloud_files").insert({
        user_id: user.id,
        folder_id: folder_id || null,
        name: file_name,
        blob_id,
        size: blob.size,
        mime_type: mime_type || "application/octet-stream",
        checksum: checksum || blob.checksum,
        version: 1,
      }).select().single();

      if (error) return corsError(error.message, 500);

      // Create initial version
      await supabase.from("cloud_file_versions").insert({
        user_id: user.id,
        file_id: file.id,
        version: 1,
        blob_id,
        size: blob.size,
        checksum: checksum || blob.checksum,
      });

      return corsResponse({ file });
    }

    // DELETE — soft delete to trash
    if (action === "delete") {
      const { file_id } = body;
      if (!file_id) return corsError("file_id required", 400);

      const { data: file } = await supabase.from("cloud_files")
        .select("*").eq("id", file_id).eq("user_id", user.id).single();

      if (!file) return corsError("File not found", 404);

      // Mark deleted
      await supabase.from("cloud_files")
        .update({ deleted: true }).eq("id", file_id);

      // Add to trash
      await supabase.from("cloud_trash").insert({
        user_id: user.id,
        object_type: "file",
        object_id: file_id,
        original_name: file.name,
        original_path: file.folder_id || "/",
        size: file.size,
      });

      // Update quota
      const { data: quota } = await supabase.from("cloud_storage_usage")
        .select("used_bytes, file_count").eq("user_id", user.id).maybeSingle();

      if (quota) {
        await supabase.from("cloud_storage_usage").update({
          used_bytes: Math.max(0, (quota.used_bytes || 0) - file.size),
          file_count: Math.max(0, (quota.file_count || 0) - 1),
        }).eq("user_id", user.id);
      }

      return corsResponse({ success: true });
    }

    // RESTORE from trash
    if (action === "restore") {
      const { trash_id } = body;
      if (!trash_id) return corsError("trash_id required", 400);

      const { data: trashItem } = await supabase.from("cloud_trash")
        .select("*").eq("id", trash_id).eq("user_id", user.id).single();

      if (!trashItem) return corsError("Trash item not found", 404);

      // Undelete file
      await supabase.from("cloud_files")
        .update({ deleted: false }).eq("id", trashItem.object_id);

      // Remove from trash
      await supabase.from("cloud_trash").delete().eq("id", trash_id);

      // Re-add to quota
      const { data: quota } = await supabase.from("cloud_storage_usage")
        .select("used_bytes, file_count, quota_bytes").eq("user_id", user.id).maybeSingle();

      if (quota) {
        await supabase.from("cloud_storage_usage").update({
          used_bytes: (quota.used_bytes || 0) + (trashItem.size || 0),
          file_count: (quota.file_count || 0) + 1,
        }).eq("user_id", user.id);
      }

      return corsResponse({ success: true });
    }

    // RENAME
    if (action === "rename") {
      const { file_id, folder_id, new_name } = body;
      if (!new_name) return corsError("new_name required", 400);

      if (file_id) {
        await supabase.from("cloud_files").update({ name: new_name }).eq("id", file_id).eq("user_id", user.id);
      } else if (folder_id) {
        await supabase.from("cloud_folders").update({ name: new_name }).eq("id", folder_id).eq("user_id", user.id);
      }
      return corsResponse({ success: true });
    }

    // DOWNLOAD URL
    if (action === "download-url") {
      const { file_id } = body;
      if (!file_id) return corsError("file_id required", 400);

      const { data: file } = await supabase.from("cloud_files")
        .select("blob_id").eq("id", file_id).eq("user_id", user.id).single();
      if (!file?.blob_id) return corsError("File not found", 404);

      const { data: blob } = await supabase.from("cloud_blobs")
        .select("storage_key").eq("id", file.blob_id).single();
      if (!blob) return corsError("Blob not found", 404);

      const { data: signed } = await supabase.storage
        .from("user-files").createSignedUrl(blob.storage_key, 3600);

      return corsResponse({ url: signed?.signedUrl || null });
    }

    // VERSIONS
    if (action === "versions") {
      const { file_id } = body;
      if (!file_id) return corsError("file_id required", 400);

      const { data } = await supabase.from("cloud_file_versions")
        .select("*").eq("file_id", file_id).eq("user_id", user.id)
        .order("version", { ascending: false });

      return corsResponse({ versions: data || [] });
    }

    // TRASH LIST
    if (action === "trash") {
      const { data } = await supabase.from("cloud_trash")
        .select("*").eq("user_id", user.id).order("deleted_at", { ascending: false });

      return corsResponse({ items: data || [] });
    }

    // PURGE from trash permanently
    if (action === "purge") {
      const { trash_id } = body;
      if (!trash_id) return corsError("trash_id required", 400);

      const { data: trashItem } = await supabase.from("cloud_trash")
        .select("*").eq("id", trash_id).eq("user_id", user.id).single();

      if (!trashItem) return corsError("Not found", 404);

      // Delete actual file record and blob
      if (trashItem.object_type === "file") {
        const { data: file } = await supabase.from("cloud_files")
          .select("blob_id").eq("id", trashItem.object_id).single();

        if (file?.blob_id) {
          const { data: blob } = await supabase.from("cloud_blobs")
            .select("storage_key").eq("id", file.blob_id).single();
          if (blob) {
            await supabase.storage.from("user-files").remove([blob.storage_key]);
            await supabase.from("cloud_blobs").delete().eq("id", file.blob_id);
          }
        }
        await supabase.from("cloud_files").delete().eq("id", trashItem.object_id);
      }
      await supabase.from("cloud_trash").delete().eq("id", trash_id);

      return corsResponse({ success: true });
    }

    return corsError(`Unknown action: ${action}`, 400);
  } catch (err) {
    return corsError(err instanceof Error ? err.message : "Internal error", 500);
  }
});
