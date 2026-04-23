import { supabase } from "@/integrations/supabase/client";
const db = supabase as any;
import type { IndexableItem, SearchDomain } from "@/lib/core-services/search-fabric";

async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function fetchFilesOverview() {
  const user = await getUser();
  // Unauthenticated/demo path keeps curated fixtures so the surface remains expressive.
  if (!user) return [] as any[];
  // Authenticated users always get real data — empty array means honest empty state.
  const { data, error } = await db.from("file_metadata").select("*").eq("user_id", user.id).order("created_at", { ascending: false }) as { data: any[]; error: any };
  if (error || !data) return [];
  return data.map((f: any) => ({ name: f.filename, mime: f.mime_type || "application/octet-stream", text: f.extracted_data?.text || "" }));
}

export async function fetchFilesProcessing() {
  const user = await getUser();
  if (!user) return [] as any[];
  const { data, error } = await db.from("file_metadata").select("*").eq("user_id", user.id).eq("status", "processing").order("created_at", { ascending: false }) as { data: any[]; error: any };
  if (error || !data) return [];
  return data.map((f: any) => ({ filename: f.filename, mimeType: f.mime_type, sizeBytes: Number(f.size_bytes), textContent: f.extracted_data?.text || "", uploadedBy: "owner" }));
}

export async function fetchAllFiles() {
  const user = await getUser();
  if (!user) return [];
  const { data, error } = await db.from("file_metadata").select("*").eq("user_id", user.id).order("created_at", { ascending: false }) as { data: any[]; error: any };
  if (error || !data) return [];
  return data;
}

export async function fetchFilesByStatus(status: string) {
  const user = await getUser();
  if (!user) return [];
  const { data, error } = await db.from("file_metadata").select("*").eq("user_id", user.id).eq("status", status).order("created_at", { ascending: false }) as { data: any[]; error: any };
  if (error || !data) return [];
  return data;
}

export async function fetchFilesBySensitivity(sensitivities: string[]) {
  const user = await getUser();
  if (!user) return [];
  const { data, error } = await db.from("file_metadata").select("*").eq("user_id", user.id).in("sensitivity", sensitivities).order("created_at", { ascending: false }) as { data: any[]; error: any };
  if (error || !data) return [];
  return data;
}

export async function fetchFilesSearchIndex(): Promise<IndexableItem[]> {
  const user = await getUser();
  if (!user) return [] as any[];
  const { data, error } = await db.from("file_metadata").select("*").eq("user_id", user.id).order("created_at", { ascending: false }) as { data: any[]; error: any };
  if (error || !data) return [];
  return data.map((f: any, i: number) => ({
    id: f.id, type: f.classification || "document", domain: classifyDomainFromFile(f) as SearchDomain,
    title: f.filename, body: f.extracted_data?.text || "",
    tags: [f.classification, f.sensitivity, f.mime_type?.split("/")[1]].filter(Boolean) as string[],
    timestamp: new Date(f.created_at).getTime(), metadata: { sizeBytes: f.size_bytes },
    linkedEntities: [], sensitivity: f.sensitivity || "internal", actionUrl: "/files",
  }));
}

export async function fetchFileSettings() {
  const user = await getUser();
  if (!user) return null;
  const { data, error } = await db.from("file_settings").select("*").eq("user_id", user.id).maybeSingle() as { data: any; error: any };
  if (error || !data) return null;
  return data;
}

export async function upsertFileSettings(settings: Record<string, any>) {
  const user = await getUser();
  if (!user) return null;
  const { data, error } = await db.from("file_settings").upsert({ user_id: user.id, ...settings }, { onConflict: "user_id" }).select().single() as { data: any; error: any };
  if (error) throw error;
  return data;
}

function classifyDomainFromFile(f: any): string {
  const text = `${f.filename} ${f.extracted_data?.text || ""} ${f.classification || ""}`.toLowerCase();
  if (text.includes("invoice") || text.includes("contract") || text.includes("nda") || text.includes("agreement")) return "business";
  if (text.includes("bank") || text.includes("statement") || text.includes("receipt") || text.includes("bill")) return "finance";
  if (text.includes("school") || text.includes("medical") || text.includes("kid")) return "concierge";
  if (text.includes("travel") || text.includes("hotel") || text.includes("flight")) return "concierge";
  return "general";
}
