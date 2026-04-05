// SITA OS — Workspace Data Service (Mode-Aware)
import { supabase } from "@/integrations/supabase/client";
import type { RealityModeKey } from "@/lib/dual-reality/reality-mode-registry";
import { resolveByMode, type ModeAwareResult } from "@/lib/hooks/useRealityProvider";

export interface MockDoc { id: string; title: string; type: string; status: string; lastModified: string; author: string; version: number; privacy: string; content: string; governed: boolean; tags: string[]; }
export interface MockSheet { id: string; title: string; rows: number; cols: number; lastModified: string; author: string; status: string; type: string; privacy: string; }
export interface MockDeck { id: string; title: string; slideCount: number; lastModified: string; author: string; status: string; privacy: string; theme: string; }
export interface MockSlide { id: string; deckId: string; order: number; layout: string; title: string; content: string; }

const DEMO_DOCS: MockDoc[] = [
  { id: "doc1", title: "Q2 Strategic Plan", type: "document", status: "published", lastModified: "2026-04-03", author: "You", version: 3, privacy: "personal", content: "Strategic priorities for Q2 2026...", governed: true, tags: ["strategy", "quarterly"] },
  { id: "doc2", title: "Investment Policy Statement", type: "document", status: "published", lastModified: "2026-03-15", author: "You", version: 2, privacy: "personal", content: "Asset allocation targets and constraints...", governed: true, tags: ["investment", "policy"] },
  { id: "doc3", title: "Partnership Term Sheet Draft", type: "document", status: "draft", lastModified: "2026-04-04", author: "You", version: 1, privacy: "personal", content: "Terms for Atlas Corp engagement...", governed: false, tags: ["business", "legal"] },
];
const DEMO_SHEETS: MockSheet[] = [
  { id: "sh1", title: "Revenue Forecast", rows: 48, cols: 12, lastModified: "2026-04-02", author: "You", status: "active", type: "spreadsheet", privacy: "personal" },
  { id: "sh2", title: "Portfolio Allocation Model", rows: 24, cols: 8, lastModified: "2026-03-28", author: "You", status: "active", type: "spreadsheet", privacy: "personal" },
];
const DEMO_DECKS: MockDeck[] = [
  { id: "dk1", title: "Investor Presentation Q2", slideCount: 18, lastModified: "2026-04-01", author: "You", status: "draft", privacy: "personal", theme: "dark" },
  { id: "dk2", title: "Board Meeting Summary", slideCount: 12, lastModified: "2026-03-20", author: "You", status: "published", privacy: "personal", theme: "light" },
];

export async function fetchDocs(mode: RealityModeKey = "real"): Promise<ModeAwareResult<MockDoc[]>> {
  if (mode !== "real") return resolveByMode({ mode, realData: null, demoData: DEMO_DOCS, emptyDefault: [] });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return resolveByMode({ mode, realData: null, demoData: DEMO_DOCS, emptyDefault: [] });
  const { data, error } = await supabase.from("file_metadata").select("*").eq("user_id", user.id)
    .in("mime_type", ["application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"])
    .order("created_at", { ascending: false });
  const mapped = (!error && data && data.length > 0) ? data.map((f: any): MockDoc => ({
    id: f.id, title: f.filename.replace(/\.[^.]+$/, ""), type: "document",
    status: f.status === "processed" ? "published" : "draft", lastModified: f.updated_at,
    author: "You", version: 1, privacy: "personal", content: f.extracted_data?.text || "",
    governed: false, tags: [],
  })) : null;
  return resolveByMode({ mode, realData: mapped, demoData: DEMO_DOCS, emptyDefault: [] });
}

export async function fetchSheets(mode: RealityModeKey = "real"): Promise<ModeAwareResult<MockSheet[]>> {
  return resolveByMode({ mode, realData: null, demoData: DEMO_SHEETS, emptyDefault: [] });
}

export async function fetchDecks(mode: RealityModeKey = "real"): Promise<ModeAwareResult<MockDeck[]>> {
  return resolveByMode({ mode, realData: null, demoData: DEMO_DECKS, emptyDefault: [] });
}
