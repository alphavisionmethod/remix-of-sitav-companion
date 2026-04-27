// ═══════════════════════════════════════════════════════════════
// Household ↔ Business Bridge Service (Phase 3)
// ───────────────────────────────────────────────────────────────
// Closes the namespace split between Concierge entities (household
// tasks, recurring obligations, providers, appointments, errands)
// and CRM entities (crm_contacts / crm_companies). Mirrors the
// shape of crm-finance-bridge.service.ts so the validators and
// reverse-navigation helpers can treat both bridges uniformly.
//
// Owns table: public.household_business_link
// ═══════════════════════════════════════════════════════════════

import { fromTable } from "@/lib/supabase-helpers";
import { supabase } from "@/integrations/supabase/client";

export type ConciergeEntityType =
  | "household_task"
  | "recurring_obligation"
  | "provider"
  | "appointment"
  | "errand";

export type HouseholdLinkSource =
  | "manual"
  | "auto-from-task"
  | "auto-from-provider"
  | "auto-from-obligation"
  | "import";

export interface HouseholdBusinessLink {
  id: string;
  user_id: string;
  concierge_entity_type: ConciergeEntityType;
  concierge_entity_id: string;
  crm_contact_id: string | null;
  crm_company_id: string | null;
  link_source: HouseholdLinkSource;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

async function getUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw new Error(`Auth error: ${error.message}`);
  if (!data.user) throw new Error("Not authenticated");
  return data.user.id;
}

/**
 * Find every household_business_link row for a CRM contact (or company).
 * Used by CRMContactDetail / CRMCompanyDetail to surface linked
 * concierge artifacts.
 */
export async function findHouseholdLinksForCrm(input: {
  crm_contact_id?: string;
  crm_company_id?: string;
}): Promise<HouseholdBusinessLink[]> {
  if (!input.crm_contact_id && !input.crm_company_id) return [];
  const userId = await getUserId();
  let q = fromTable("household_business_link").select("*").eq("user_id", userId);
  if (input.crm_contact_id) q = q.eq("crm_contact_id", input.crm_contact_id);
  if (input.crm_company_id) q = q.eq("crm_company_id", input.crm_company_id);
  const { data, error } = await q.order("created_at", { ascending: false }).limit(100);
  if (error) throw new Error(error.message);
  return (data ?? []) as HouseholdBusinessLink[];
}

/**
 * Find every household_business_link row originating from a concierge entity.
 * Used by ServiceProviders / HouseholdTasks / RecurringObligations to
 * surface CRM back-links.
 */
export async function findCrmLinksForConciergeEntity(
  type: ConciergeEntityType,
  id: string,
): Promise<HouseholdBusinessLink[]> {
  const userId = await getUserId();
  const { data, error } = await fromTable("household_business_link")
    .select("*")
    .eq("user_id", userId)
    .eq("concierge_entity_type", type)
    .eq("concierge_entity_id", id)
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) throw new Error(error.message);
  return (data ?? []) as HouseholdBusinessLink[];
}

/**
 * Idempotent insert. Mirrors linkCrmToCustomer behavior — duplicates
 * are tolerated thanks to the unique index on the link triple.
 */
export async function linkConciergeToCrm(input: {
  concierge_entity_type: ConciergeEntityType;
  concierge_entity_id: string;
  crm_contact_id?: string | null;
  crm_company_id?: string | null;
  link_source?: HouseholdLinkSource;
  metadata?: Record<string, unknown>;
}): Promise<HouseholdBusinessLink> {
  if (!input.crm_contact_id && !input.crm_company_id) {
    throw new Error("linkConciergeToCrm requires at least one of crm_contact_id or crm_company_id");
  }
  const userId = await getUserId();

  // Idempotency: look up by triple first.
  let q = fromTable("household_business_link")
    .select("*")
    .eq("user_id", userId)
    .eq("concierge_entity_type", input.concierge_entity_type)
    .eq("concierge_entity_id", input.concierge_entity_id);
  if (input.crm_contact_id) q = q.eq("crm_contact_id", input.crm_contact_id);
  else q = q.is("crm_contact_id", null);
  if (input.crm_company_id) q = q.eq("crm_company_id", input.crm_company_id);
  else q = q.is("crm_company_id", null);

  const { data: existing } = await q.maybeSingle();
  if (existing) return existing as HouseholdBusinessLink;

  const { data, error } = await fromTable("household_business_link")
    .insert({
      user_id: userId,
      concierge_entity_type: input.concierge_entity_type,
      concierge_entity_id: input.concierge_entity_id,
      crm_contact_id: input.crm_contact_id ?? null,
      crm_company_id: input.crm_company_id ?? null,
      link_source: input.link_source ?? "manual",
      metadata: input.metadata ?? {},
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as HouseholdBusinessLink;
}

/** Remove a single link row. */
export async function unlinkConciergeFromCrm(linkId: string): Promise<void> {
  const userId = await getUserId();
  const { error } = await fromTable("household_business_link")
    .delete()
    .eq("id", linkId)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
}

/**
 * Aggregated CRM → concierge surface used by CRMConciergeLinkage to
 * fold provider rows and household tasks into the existing linkage
 * card without firing an additional N+1 sweep.
 */
export interface ConciergeLinkedSurface {
  providers: Array<{ id: string; name: string; category: string | null; status: string }>;
  household_tasks: Array<{ id: string; title: string; status: string; due_date: string | null }>;
}

export async function loadConciergeSurfaceForCrm(input: {
  crm_contact_id?: string;
  crm_company_id?: string;
}): Promise<ConciergeLinkedSurface> {
  if (!input.crm_contact_id && !input.crm_company_id) {
    return { providers: [], household_tasks: [] };
  }
  const userId = await getUserId();
  const linkColumn = input.crm_contact_id ? "crm_contact_id" : "crm_company_id";
  const linkValue = (input.crm_contact_id ?? input.crm_company_id) as string;

  const [providersResp, tasksResp] = await Promise.all([
    fromTable("providers")
      .select("id, name, category, status")
      .eq("user_id", userId)
      .eq(linkColumn, linkValue)
      .order("created_at", { ascending: false })
      .limit(20),
    fromTable("household_tasks")
      .select("id, title, status, due_date")
      .eq("user_id", userId)
      .eq(linkColumn, linkValue)
      .order("due_date", { ascending: true, nullsFirst: false })
      .limit(20),
  ]);

  return {
    providers: (providersResp.data ?? []) as ConciergeLinkedSurface["providers"],
    household_tasks: (tasksResp.data ?? []) as ConciergeLinkedSurface["household_tasks"],
  };
}