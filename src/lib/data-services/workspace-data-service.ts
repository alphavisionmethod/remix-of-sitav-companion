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

  return data.map((f: any) => ({
    id: f.id, title: f.filename.replace(/\.[^.]+$/, ""), content: f.extracted_data?.text || "",
    lastEdited: f.updated_at, status: f.status === "processed" ? "final" as const : "draft" as const,
    wordCount: (f.extracted_data?.text || "").split(/\s+/).length,
  }));
}

export async function fetchSheets(): Promise<MockSheet[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return MOCK_SHEETS;
  // Sheets are complex structured data - use mocks until dedicated table
  return MOCK_SHEETS;
}

export async function fetchDecks(): Promise<MockDeck[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return MOCK_DECKS;
  // Slide decks need dedicated table - use mocks
  return MOCK_DECKS;
}
