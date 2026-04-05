import { supabase } from "@/integrations/supabase/client";
import { MOCK_DOCS, type MockDoc, MOCK_SHEETS, type MockSheet, MOCK_DECKS, type MockDeck, type MockSlide } from "@/lib/mock-data/workspace";

export type { MockDoc, MockSheet, MockDeck, MockSlide };

export async function fetchDocs(): Promise<MockDoc[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return MOCK_DOCS;

  const { data, error } = await supabase.from("file_metadata").select("*").eq("user_id", user.id)
    .in("mime_type", ["application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"])
    .order("created_at", { ascending: false });
  if (error || !data || data.length === 0) return MOCK_DOCS;

  return data.map((f: any): MockDoc => ({
    id: f.id, title: f.filename.replace(/\.[^.]+$/, ""),
    type: "document", status: f.status === "processed" ? "published" : "draft",
    lastModified: f.updated_at, author: "You",
    version: 1, privacy: "personal",
    content: f.extracted_data?.text || "", governed: false, tags: [],
  }));
}

export async function fetchSheets(): Promise<MockSheet[]> {
  return MOCK_SHEETS;
}

export async function fetchDecks(): Promise<MockDeck[]> {
  return MOCK_DECKS;
}
