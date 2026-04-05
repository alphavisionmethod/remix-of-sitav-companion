// SITA OS — Workspace Data Service (Mode-Aware)
import { supabase } from "@/integrations/supabase/client";
import type { RealityModeKey } from "@/lib/dual-reality/reality-mode-registry";
import { resolveByMode, type ModeAwareResult } from "@/lib/hooks/useRealityProvider";

// Re-export the rich types directly from mock-data for full compatibility
export type { MockDoc, MockSheet, MockDeck, MockSlide } from "@/lib/mock-data/workspace";
import type { MockDoc, MockSheet, MockDeck } from "@/lib/mock-data/workspace";
import { MOCK_DOCS, MOCK_SHEETS, MOCK_DECKS } from "@/lib/mock-data/workspace";

export async function fetchDocs(mode: RealityModeKey = "real"): Promise<ModeAwareResult<MockDoc[]>> {
  if (mode !== "real") return resolveByMode({ mode, realData: null, demoData: MOCK_DOCS, emptyDefault: [] });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return resolveByMode({ mode, realData: null, demoData: MOCK_DOCS, emptyDefault: [] });
  const { data, error } = await supabase.from("file_metadata").select("*").eq("user_id", user.id)
    .in("mime_type", ["application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"])
    .order("created_at", { ascending: false });
  const mapped = (!error && data && data.length > 0) ? data.map((f: any): MockDoc => ({
    id: f.id, title: f.filename.replace(/\.[^.]+$/, ""), type: "document" as const,
    status: f.status === "processed" ? "published" as const : "draft" as const, lastModified: f.updated_at,
    author: "You", version: 1, privacy: "personal" as const, content: f.extracted_data?.text || "",
    governed: false, tags: [],
  })) : null;
  return resolveByMode({ mode, realData: mapped, demoData: MOCK_DOCS, emptyDefault: [] });
}

export async function fetchSheets(mode: RealityModeKey = "real"): Promise<ModeAwareResult<MockSheet[]>> {
  return resolveByMode({ mode, realData: null, demoData: MOCK_SHEETS, emptyDefault: [] });
}

export async function fetchDecks(mode: RealityModeKey = "real"): Promise<ModeAwareResult<MockDeck[]>> {
  return resolveByMode({ mode, realData: null, demoData: MOCK_DECKS, emptyDefault: [] });
}
