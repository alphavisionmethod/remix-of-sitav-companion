import { supabase } from "@/integrations/supabase/client";
import { MOCK_FILES_OVERVIEW, MOCK_FILES_PROCESSING, MOCK_FILES_SEARCH_INDEX } from "@/lib/mock-data/files";

export async function fetchFilesOverview() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return MOCK_FILES_OVERVIEW;

  const { data, error } = await supabase.from("file_metadata").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
  if (error || !data || data.length === 0) return MOCK_FILES_OVERVIEW;

  return data.map((f: any) => ({
    name: f.filename, mime: f.mime_type, text: f.extracted_data?.text || "",
  }));
}

export async function fetchFilesProcessing() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return MOCK_FILES_PROCESSING;

  const { data, error } = await supabase.from("file_metadata").select("*").eq("user_id", user.id).eq("status", "processing").order("created_at", { ascending: false });
  if (error || !data || data.length === 0) return MOCK_FILES_PROCESSING;

  return data.map((f: any) => ({
    filename: f.filename, mimeType: f.mime_type, sizeBytes: Number(f.size_bytes),
    textContent: f.extracted_data?.text || "", uploadedBy: "owner",
  }));
}

export async function fetchFilesSearchIndex() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return MOCK_FILES_SEARCH_INDEX;
  // Search index comes from multiple sources - fallback for now
  return MOCK_FILES_SEARCH_INDEX;
}
