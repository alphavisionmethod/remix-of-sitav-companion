// ═══════════════════════════════════════════════════════════════
// SITA OS — Workspace Data Service (Mode-Aware)
// Queries public.documents table with document_type filtering
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import type { RealityModeKey } from "@/lib/dual-reality/reality-mode-registry";
import { resolveByMode, type ModeAwareResult } from "@/hooks/useRealityProvider";

export type { MockDoc, MockSheet, MockDeck, MockSlide } from "@/data/fixtures/mock-data/workspace";
import type { MockDoc, MockSheet, MockDeck } from "@/data/fixtures/mock-data/workspace";
const DOC_TYPES = ["document", "proposal", "report", "boardroom-packet", "note"];

export async function fetchDocs(mode: RealityModeKey = "real"): Promise<ModeAwareResult<MockDoc[]>> {
  if (mode !== "real") return resolveByMode({ mode, realData: null, demoData: [] as any[], emptyDefault: [] });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return resolveByMode({ mode, realData: null, demoData: [] as any[], emptyDefault: [] });
  const { data, error } = await fromTable("documents").select("*")
    .eq("user_id", user.id).in("document_type", DOC_TYPES)
    .order("updated_at", { ascending: false });
  const mapped = (!error && data?.length) ? data.map((d: any): MockDoc => ({
    id: d.id, title: d.title, type: d.document_type as never,
    status: d.status as never, lastModified: d.updated_at, author: d.author || "You",
    linkedEntity: d.linked_entity, linkedWorkflow: d.linked_workflow,
    version: d.version || 1, privacy: d.privacy as never, content: d.content || "",
    governed: d.governed || false, tags: d.tags || [],
  })) : null;
  return resolveByMode({ mode, realData: mapped, demoData: [] as any[], emptyDefault: [] });
}

export async function fetchSheets(mode: RealityModeKey = "real"): Promise<ModeAwareResult<MockSheet[]>> {
  if (mode !== "real") return resolveByMode({ mode, realData: null, demoData: [] as any[], emptyDefault: [] });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return resolveByMode({ mode, realData: null, demoData: [] as any[], emptyDefault: [] });
  const { data, error } = await fromTable("documents").select("*")
    .eq("user_id", user.id).eq("document_type", "sheet")
    .order("updated_at", { ascending: false });
  const mapped = (!error && data?.length) ? data.map((d: any): MockSheet => ({
    id: d.id, name: d.title, type: (d.linked_domain || "custom") as never,
    lastModified: d.updated_at, linkedDomain: d.linked_domain || "",
    columns: Array.isArray(d.columns_config) ? d.columns_config : [],
    data: Array.isArray(d.data_rows) ? d.data_rows : [],
    formulas: d.formulas || {},
  })) : null;
  return resolveByMode({ mode, realData: mapped, demoData: [] as any[], emptyDefault: [] });
}

export async function fetchDecks(mode: RealityModeKey = "real"): Promise<ModeAwareResult<MockDeck[]>> {
  if (mode !== "real") return resolveByMode({ mode, realData: null, demoData: [] as any[], emptyDefault: [] });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return resolveByMode({ mode, realData: null, demoData: [] as any[], emptyDefault: [] });
  const { data, error } = await fromTable("documents").select("*")
    .eq("user_id", user.id).eq("document_type", "deck")
    .order("updated_at", { ascending: false });
  const mapped = (!error && data?.length) ? data.map((d: any): MockDeck => ({
    id: d.id, title: d.title, type: (d.linked_domain || "custom") as never,
    slides: Array.isArray(d.slides) ? d.slides : [],
    status: d.status as never, lastModified: d.updated_at,
    linkedBoardroom: d.linked_entity, privacy: d.privacy as never,
  })) : null;
  return resolveByMode({ mode, realData: mapped, demoData: [] as any[], emptyDefault: [] });
}
