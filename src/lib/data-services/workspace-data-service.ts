// ═══════════════════════════════════════════════════════════════
// SITA OS — Workspace Data Service (Mode-Aware)
// Queries public.documents table with document_type filtering
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import type { RealityModeKey } from "@/lib/dual-reality/reality-mode-registry";
import { resolveByMode, type ModeAwareResult } from "@/lib/hooks/useRealityProvider";

export type { MockDoc, MockSheet, MockDeck, MockSlide } from "@/lib/mock-data/workspace";
import type { MockDoc, MockSheet, MockDeck } from "@/lib/mock-data/workspace";
import { MOCK_DOCS, MOCK_SHEETS, MOCK_DECKS } from "@/lib/mock-data/workspace";

const DOC_TYPES = ["document", "proposal", "report", "boardroom-packet", "note"];

export async function fetchDocs(mode: RealityModeKey = "real"): Promise<ModeAwareResult<MockDoc[]>> {
  if (mode !== "real") return resolveByMode({ mode, realData: null, demoData: MOCK_DOCS, emptyDefault: [] });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return resolveByMode({ mode, realData: null, demoData: MOCK_DOCS, emptyDefault: [] });
  const { data, error } = await (supabase as any).from("documents").select("*")
    .eq("user_id", user.id).in("document_type", DOC_TYPES)
    .order("updated_at", { ascending: false });
  const mapped = (!error && data?.length) ? data.map((d: any): MockDoc => ({
    id: d.id, title: d.title, type: d.document_type as any,
    status: d.status as any, lastModified: d.updated_at, author: d.author || "You",
    linkedEntity: d.linked_entity, linkedWorkflow: d.linked_workflow,
    version: d.version || 1, privacy: d.privacy as any, content: d.content || "",
    governed: d.governed || false, tags: d.tags || [],
  })) : null;
  return resolveByMode({ mode, realData: mapped, demoData: MOCK_DOCS, emptyDefault: [] });
}

export async function fetchSheets(mode: RealityModeKey = "real"): Promise<ModeAwareResult<MockSheet[]>> {
  if (mode !== "real") return resolveByMode({ mode, realData: null, demoData: MOCK_SHEETS, emptyDefault: [] });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return resolveByMode({ mode, realData: null, demoData: MOCK_SHEETS, emptyDefault: [] });
  const { data, error } = await (supabase as any).from("documents").select("*")
    .eq("user_id", user.id).eq("document_type", "sheet")
    .order("updated_at", { ascending: false });
  const mapped = (!error && data?.length) ? data.map((d: any): MockSheet => ({
    id: d.id, name: d.title, type: (d.linked_domain || "custom") as any,
    lastModified: d.updated_at, linkedDomain: d.linked_domain || "",
    columns: Array.isArray(d.columns_config) ? d.columns_config : [],
    data: Array.isArray(d.data_rows) ? d.data_rows : [],
    formulas: d.formulas || {},
  })) : null;
  return resolveByMode({ mode, realData: mapped, demoData: MOCK_SHEETS, emptyDefault: [] });
}

export async function fetchDecks(mode: RealityModeKey = "real"): Promise<ModeAwareResult<MockDeck[]>> {
  if (mode !== "real") return resolveByMode({ mode, realData: null, demoData: MOCK_DECKS, emptyDefault: [] });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return resolveByMode({ mode, realData: null, demoData: MOCK_DECKS, emptyDefault: [] });
  const { data, error } = await (supabase as any).from("documents").select("*")
    .eq("user_id", user.id).eq("document_type", "deck")
    .order("updated_at", { ascending: false });
  const mapped = (!error && data?.length) ? data.map((d: any): MockDeck => ({
    id: d.id, title: d.title, type: (d.linked_domain || "custom") as any,
    slides: Array.isArray(d.slides) ? d.slides : [],
    status: d.status as any, lastModified: d.updated_at,
    linkedBoardroom: d.linked_entity, privacy: d.privacy as any,
  })) : null;
  return resolveByMode({ mode, realData: mapped, demoData: MOCK_DECKS, emptyDefault: [] });
}
