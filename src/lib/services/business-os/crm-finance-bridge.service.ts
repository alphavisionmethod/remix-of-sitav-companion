// ═══════════════════════════════════════════════════════════════
// CRM ↔ Finance Bridge Service (Phase 4)
// ───────────────────────────────────────────────────────────────
// Closes the namespace split between CRM (crm_contacts / crm_companies)
// and Finance (customers). Provides bidirectional lookup and an
// auto-create path so a CRM-driven flow can produce a billing customer
// once and re-use it forever after via crm_customer_link.
// ═══════════════════════════════════════════════════════════════

import { fromTable } from "@/lib/supabase-helpers";
import { supabase } from "@/integrations/supabase/client";

export type LinkSource = "manual" | "auto-from-quote" | "auto-from-invoice" | "auto-from-proposal" | "import";

export interface CrmCustomerLink {
  id: string;
  user_id: string;
  crm_contact_id: string;
  crm_company_id: string | null;
  customer_id: string;
  link_source: LinkSource;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface BridgeResolution {
  customer_id: string;
  link_id: string | null;
  created_customer: boolean;
  source: LinkSource;
}

async function getUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw new Error(`Auth error: ${error.message}`);
  if (!data.user) throw new Error("Not authenticated");
  return data.user.id;
}

/**
 * Look up an existing customer for a CRM contact via the bridge.
 * Returns null if no link exists yet.
 */
export async function findCustomerForContact(
  crmContactId: string,
): Promise<{ customer_id: string; link_id: string } | null> {
  const userId = await getUserId();
  const { data, error } = await fromTable("crm_customer_link")
    .select("id, customer_id")
    .eq("user_id", userId)
    .eq("crm_contact_id", crmContactId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  const row = data as { id: string; customer_id: string };
  return { customer_id: row.customer_id, link_id: row.id };
}

/**
 * Look up the CRM contact (if any) linked to a billing customer.
 */
export async function findContactForCustomer(
  customerId: string,
): Promise<{ crm_contact_id: string; crm_company_id: string | null; link_id: string } | null> {
  const userId = await getUserId();
  const { data, error } = await fromTable("crm_customer_link")
    .select("id, crm_contact_id, crm_company_id")
    .eq("user_id", userId)
    .eq("customer_id", customerId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  const row = data as { id: string; crm_contact_id: string; crm_company_id: string | null };
  return {
    crm_contact_id: row.crm_contact_id,
    crm_company_id: row.crm_company_id,
    link_id: row.id,
  };
}

/**
 * Insert a bridge row. Idempotent on the (user, contact, customer) triple
 * thanks to the unique index — duplicates are tolerated.
 */
export async function linkCrmToCustomer(input: {
  crm_contact_id: string;
  customer_id: string;
  crm_company_id?: string | null;
  link_source?: LinkSource;
  metadata?: Record<string, unknown>;
}): Promise<CrmCustomerLink> {
  const userId = await getUserId();
  // Try to find an existing link first to keep the call idempotent.
  const existing = await fromTable("crm_customer_link")
    .select("*")
    .eq("user_id", userId)
    .eq("crm_contact_id", input.crm_contact_id)
    .eq("customer_id", input.customer_id)
    .maybeSingle();
  if (!existing.error && existing.data) {
    return existing.data as unknown as CrmCustomerLink;
  }

  const { data, error } = await fromTable("crm_customer_link")
    .insert({
      user_id: userId,
      crm_contact_id: input.crm_contact_id,
      customer_id: input.customer_id,
      crm_company_id: input.crm_company_id ?? null,
      link_source: input.link_source ?? "manual",
      metadata: input.metadata ?? {},
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as unknown as CrmCustomerLink;
}

/**
 * Look up an existing customer by email (case-insensitive). Used to avoid
 * duplicates when auto-creating a customer from a CRM contact.
 */
async function findCustomerByEmail(email: string): Promise<{ id: string } | null> {
  const userId = await getUserId();
  const { data, error } = await fromTable("customers")
    .select("id")
    .eq("user_id", userId)
    .ilike("primary_email", email)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) return null;
  if (!data) return null;
  return data as { id: string };
}

/**
 * Auto-create (or reuse) a billing customer derived from a CRM contact.
 * Steps:
 *   1. If a bridge link already exists → return that customer (no writes).
 *   2. Else, if a customer exists with the same email → reuse it and link.
 *   3. Else, create a fresh `customers` row from the contact, then link.
 */
export async function createCustomerFromContact(
  crmContactId: string,
  opts: { source?: LinkSource } = {},
): Promise<BridgeResolution> {
  const linked = await findCustomerForContact(crmContactId);
  if (linked) {
    return {
      customer_id: linked.customer_id,
      link_id: linked.link_id,
      created_customer: false,
      source: "manual",
    };
  }

  const userId = await getUserId();

  // Pull the contact so we know what to write into customers.
  const { data: contactRow, error: contactErr } = await fromTable("crm_contacts")
    .select("id, first_name, last_name, email, phone")
    .eq("id", crmContactId)
    .eq("user_id", userId)
    .maybeSingle();
  if (contactErr) throw new Error(contactErr.message);
  if (!contactRow) throw new Error("CRM contact not found or not accessible");

  const contact = contactRow as {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    phone: string | null;
  };
  const displayName =
    [contact.first_name, contact.last_name].filter(Boolean).join(" ").trim() ||
    contact.email ||
    "Unnamed customer";

  // Step 2: try email match for de-duplication.
  let customerId: string | null = null;
  let createdCustomer = false;
  if (contact.email) {
    const existing = await findCustomerByEmail(contact.email);
    if (existing) customerId = existing.id;
  }

  // Step 3: create.
  if (!customerId) {
    const { data: created, error: createErr } = await fromTable("customers")
      .insert({
        user_id: userId,
        display_name: displayName,
        primary_email: contact.email ?? null,
        primary_phone: contact.phone ?? null,
        status: "active",
        metadata: { source: "crm_contact", crm_contact_id: contact.id },
      })
      .select("id")
      .single();
    if (createErr) throw new Error(createErr.message);
    customerId = (created as { id: string }).id;
    createdCustomer = true;
  }

  const link = await linkCrmToCustomer({
    crm_contact_id: contact.id,
    customer_id: customerId,
    link_source: opts.source ?? "manual",
    metadata: { display_name: displayName },
  });

  return {
    customer_id: customerId,
    link_id: link.id,
    created_customer: createdCustomer,
    source: link.link_source,
  };
}

/**
 * High-level resolver used by handlers: takes whatever the caller passed
 * (customer_id and/or crm_contact_id) and returns a guaranteed customer_id.
 * If a contact is provided without a customer, a customer is auto-created
 * via the bridge. Returns null only when neither input is given.
 */
export async function resolveCustomerId(input: {
  customer_id?: string | null;
  crm_contact_id?: string | null;
  source?: LinkSource;
}): Promise<{ customer_id: string | null; link_id: string | null; created_customer: boolean }> {
  if (input.customer_id) {
    // If we also have a contact and no link yet, opportunistically create one.
    if (input.crm_contact_id) {
      const existing = await findCustomerForContact(input.crm_contact_id);
      if (!existing) {
        try {
          const link = await linkCrmToCustomer({
            crm_contact_id: input.crm_contact_id,
            customer_id: input.customer_id,
            link_source: input.source ?? "manual",
          });
          return { customer_id: input.customer_id, link_id: link.id, created_customer: false };
        } catch {
          // Non-fatal: continue with the customer_id even if link write fails.
        }
      } else {
        return { customer_id: input.customer_id, link_id: existing.link_id, created_customer: false };
      }
    }
    return { customer_id: input.customer_id, link_id: null, created_customer: false };
  }

  if (input.crm_contact_id) {
    const res = await createCustomerFromContact(input.crm_contact_id, { source: input.source ?? "auto-from-quote" });
    return { customer_id: res.customer_id, link_id: res.link_id, created_customer: res.created_customer };
  }

  return { customer_id: null, link_id: null, created_customer: false };
}

/** Read all bridge rows for a contact (rare: contacts can map to multiple billing customers). */
export async function listLinksForContact(crmContactId: string): Promise<CrmCustomerLink[]> {
  const userId = await getUserId();
  const { data, error } = await fromTable("crm_customer_link")
    .select("*")
    .eq("user_id", userId)
    .eq("crm_contact_id", crmContactId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as CrmCustomerLink[];
}

/** Delete a bridge row (does not delete the underlying contact or customer). */
export async function unlinkCrmCustomer(linkId: string): Promise<void> {
  const userId = await getUserId();
  const { error } = await fromTable("crm_customer_link")
    .delete()
    .eq("id", linkId)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
}

// ─────────────────────────────────────────────────────────────────────
// Phase 2 (Cross-Module Integration Deepening) — company-side helpers.
//
// `crm_customer_link.crm_contact_id` is NOT NULL by schema, so company
// linkage is expressed as the union of links carried by the company's
// contacts. These helpers give the Finance ↔ CRM bridge a company-aware
// surface without introducing a parallel "company link" table.
// ─────────────────────────────────────────────────────────────────────

/**
 * List the billing customers reachable from a CRM company, by walking
 * its contacts. Returns the deduplicated set of customer ids together
 * with the link rows that proved each one.
 */
export async function findCustomersForCompany(
  crmCompanyId: string,
): Promise<{ customer_id: string; link_id: string; crm_contact_id: string }[]> {
  const userId = await getUserId();
  const { data, error } = await fromTable("crm_customer_link")
    .select("id, customer_id, crm_contact_id")
    .eq("user_id", userId)
    .eq("crm_company_id", crmCompanyId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as Array<{ id: string; customer_id: string; crm_contact_id: string }>;
  const seen = new Set<string>();
  const out: { customer_id: string; link_id: string; crm_contact_id: string }[] = [];
  for (const r of rows) {
    if (seen.has(r.customer_id)) continue;
    seen.add(r.customer_id);
    out.push({ customer_id: r.customer_id, link_id: r.id, crm_contact_id: r.crm_contact_id });
  }
  return out;
}

/**
 * Resolve a single customer for a company. Picks the most recently linked
 * contact's customer (deterministic and matches the UI's "primary contact"
 * heuristic). Returns null when no contact under the company has been
 * billed yet.
 */
export async function findPrimaryCustomerForCompany(
  crmCompanyId: string,
): Promise<{ customer_id: string; link_id: string; crm_contact_id: string } | null> {
  const all = await findCustomersForCompany(crmCompanyId);
  return all[0] ?? null;
}

/**
 * Given a billing customer id, walk back to the CRM contact + (optional)
 * company that originated it. Used by Finance detail surfaces to render
 * the "Open in CRM" back-link.
 */
export async function resolveCrmEntityForCustomer(customerId: string): Promise<
  | {
      crm_contact_id: string;
      crm_company_id: string | null;
      link_id: string;
      contact_name: string | null;
      company_name: string | null;
    }
  | null
> {
  const userId = await getUserId();
  const { data, error } = await fromTable("crm_customer_link")
    .select(
      "id, crm_contact_id, crm_company_id, crm_contacts(first_name, last_name), crm_companies(name)",
    )
    .eq("user_id", userId)
    .eq("customer_id", customerId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  const row = data as {
    id: string;
    crm_contact_id: string;
    crm_company_id: string | null;
    crm_contacts: { first_name: string | null; last_name: string | null } | null;
    crm_companies: { name: string | null } | null;
  };
  const contactName = row.crm_contacts
    ? [row.crm_contacts.first_name, row.crm_contacts.last_name].filter(Boolean).join(" ").trim() ||
      null
    : null;
  return {
    crm_contact_id: row.crm_contact_id,
    crm_company_id: row.crm_company_id,
    link_id: row.id,
    contact_name: contactName,
    company_name: row.crm_companies?.name ?? null,
  };
}
