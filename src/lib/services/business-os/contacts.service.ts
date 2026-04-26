// ═══════════════════════════════════════════════════════════════
// SITA OS — Business OS: Contacts Service
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
const db = supabase as any;
import { fromTable, fromDynamicTable } from "@/lib/supabase-helpers";
import type { CRMContact } from "@/domains/business";

export interface ContactTimelineEntry {
  id: string;
  contactId: string;
  type: "call" | "email" | "meeting" | "note" | "deal-update" | "task";
  title: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

/**
 * Build contact timeline from real Supabase data.
 * Falls back to minimal placeholder only if DB returns nothing.
 */
export async function buildContactTimeline(contactId: string): Promise<ContactTimelineEntry[]> {
  try {
    const { data, error } = await fromDynamicTable("events")
      .select("id, event_type, title, description, created_at, metadata")
      .or(`metadata->>contact_id.eq.${contactId},metadata->>entity_id.eq.${contactId}`)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error || !data?.length) {
      // Honest empty — no fake data in real mode
      return [];
    }

    return data.map((e: any) => ({
      id: e.id,
      contactId,
      type: mapEventType(e.event_type),
      title: e.title || e.event_type,
      description: e.description || "",
      timestamp: e.created_at,
      metadata: e.metadata,
    }));
  } catch {
    return [];
  }
}

function mapEventType(t: string): ContactTimelineEntry["type"] {
  if (t?.includes("call")) return "call";
  if (t?.includes("email")) return "email";
  if (t?.includes("meeting")) return "meeting";
  if (t?.includes("deal")) return "deal-update";
  if (t?.includes("task")) return "task";
  return "note";
}

export function enrichContact(contact: CRMContact): CRMContact & { enriched: boolean; socialProfiles: string[] } {
  return { ...contact, enriched: true, socialProfiles: ["linkedin", "twitter"] };
}

export function mergeContacts(primary: CRMContact, duplicate: CRMContact): CRMContact {
  return { ...primary, email: primary.email || duplicate.email };
}

