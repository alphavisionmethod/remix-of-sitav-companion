import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";

export interface ExplorerFolder {
  id: string;
  user_id: string;
  parent_id: string | null;
  name: string;
  path_cache: string;
  created_at: string;
  updated_at: string;
}

export interface ExplorerFile {
  id: string;
  user_id: string;
  folder_id: string | null;
  name: string;
  blob_id: string | null;
  size: number;
  mime_type: string | null;
  checksum: string | null;
  version: number;
  deleted: boolean;
  last_opened_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BreadcrumbItem {
  id: string | null;
  name: string;
}

// ── Folders ──

export async function fetchFolderContents(folderId: string | null) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const folderQuery = fromTable("cloud_folders")
    .select("*")
    .eq("user_id", user.id)
    .order("name");

  if (folderId) {
    folderQuery.eq("parent_id", folderId);
  } else {
    folderQuery.is("parent_id", null);
  }

  const { data: folders, error: fe } = await folderQuery;
  if (fe) throw fe;

  const fileQuery = fromTable("cloud_files")
    .select("*")
    .eq("user_id", user.id)
    .eq("deleted", false)
    .order("name");

  if (folderId) {
    fileQuery.eq("folder_id", folderId);
  } else {
    fileQuery.is("folder_id", null);
  }

  const { data: files, error: fle } = await fileQuery;
  if (fle) throw fle;

  return {
    folders: (folders || []) as ExplorerFolder[],
    files: (files || []) as ExplorerFile[],
  };
}

export async function createFolder(name: string, parentId: string | null) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const pathCache = parentId ? `/${parentId}/${name}` : `/${name}`;
  const { data, error } = await fromTable("cloud_folders")
    .insert({ user_id: user.id, parent_id: parentId, name, path_cache: pathCache })
    .select()
    .single();
  if (error) throw error;
  return data as ExplorerFolder;
}

export async function renameFolder(id: string, name: string) {
  const { error } = await fromTable("cloud_folders")
    .update({ name, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteFolder(id: string) {
  // Delete all files in folder first
  await fromTable("cloud_files").delete().eq("folder_id", id);
  // Delete sub-folders recursively
  const { data: subs } = await fromTable("cloud_folders").select("id").eq("parent_id", id);
  for (const sub of subs || []) {
    await deleteFolder(sub.id);
  }
  const { error } = await fromTable("cloud_folders").delete().eq("id", id);
  if (error) throw error;
}

// ── Files ──

export async function renameFile(id: string, name: string) {
  const { error } = await fromTable("cloud_files")
    .update({ name, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function moveFile(id: string, folderId: string | null) {
  const { error } = await fromTable("cloud_files")
    .update({ folder_id: folderId, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function softDeleteFile(id: string) {
  const { error } = await fromTable("cloud_files")
    .update({ deleted: true, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function restoreFile(id: string) {
  const { error } = await fromTable("cloud_files")
    .update({ deleted: false, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function permanentDeleteFile(id: string) {
  // Get the file to find storage path
  const { data: file } = await fromTable("cloud_files").select("*").eq("id", id).single();
  if (file?.blob_id) {
    await supabase.storage.from("user-files").remove([file.blob_id]);
  }
  await fromTable("cloud_file_versions").delete().eq("file_id", id);
  await fromTable("cloud_files").delete().eq("id", id);
}

export async function uploadFileToFolder(file: File, folderId: string | null) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const ext = file.name.split(".").pop() || "bin";
  const blobId = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error: uploadErr } = await supabase.storage
    .from("user-files")
    .upload(blobId, file, { contentType: file.type, upsert: false });
  if (uploadErr) throw uploadErr;

  const { data, error } = await fromTable("cloud_files")
    .insert({
      user_id: user.id,
      folder_id: folderId,
      name: file.name,
      blob_id: blobId,
      size: file.size,
      mime_type: file.type || "application/octet-stream",
      version: 1,
      deleted: false,
    })
    .select()
    .single();
  if (error) throw error;
  return data as ExplorerFile;
}

export async function downloadFile(fileRecord: ExplorerFile) {
  if (!fileRecord.blob_id) throw new Error("No blob associated");
  const { data, error } = await supabase.storage
    .from("user-files")
    .createSignedUrl(fileRecord.blob_id, 3600);
  if (error) throw error;
  return data.signedUrl;
}

// ── Breadcrumbs ──

export async function fetchBreadcrumbs(folderId: string | null): Promise<BreadcrumbItem[]> {
  const crumbs: BreadcrumbItem[] = [{ id: null, name: "Home" }];
  let currentId = folderId;

  while (currentId) {
    const { data } = await fromTable("cloud_folders")
      .select("id, name, parent_id")
      .eq("id", currentId)
      .single();
    if (!data) break;
    crumbs.push({ id: data.id, name: data.name });
    currentId = data.parent_id;
  }

  // Reverse so Home is first, then walk back
  // Actually crumbs are already in order: Home, then deepest-first...
  // We need to reverse the folder chain
  const home = crumbs[0];
  const folderChain = crumbs.slice(1).reverse();
  return [home, ...folderChain];
}

// ── Trash ──

export async function fetchTrash() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await fromTable("cloud_files")
    .select("*")
    .eq("user_id", user.id)
    .eq("deleted", true)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data || []) as ExplorerFile[];
}

export async function emptyTrash() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const files = await fetchTrash();
  for (const f of files) {
    await permanentDeleteFile(f.id);
  }
}

// ── Folder tree ──

export async function fetchAllFolders() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await fromTable("cloud_folders")
    .select("*")
    .eq("user_id", user.id)
    .order("name");
  if (error) throw error;
  return (data || []) as ExplorerFolder[];
}
