// ═══════════════════════════════════════════════════════════════
// SITA OS — Identity Provider Service
// Manages sign-in identity providers (NOT external connectors)
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
const db = supabase as any;
import type {
  IdentityProviderRegistry,
  IdentityProviderLink,
  IdentityMethodView,
  IdentitySessionAudit,
  IdentitySessionAuditInsert,
} from "./types";

// ── Registry: which identity providers are available ───────────
export async function getIdentityProviderRegistry(): Promise<IdentityProviderRegistry[]> {
  const { data, error } = await db.from("identity_provider_registry")
    .select("*")
    .eq("is_active", true)
    .order("display_name");
  if (error) throw error;
  return data ?? [];
}

export async function getIdentityProviderByKey(key: string): Promise<IdentityProviderRegistry | null> {
  const { data, error } = await db.from("identity_provider_registry")
    .select("*")
    .eq("identity_key", key)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// ── Links: which identity providers a user has linked ──────────
export async function getUserIdentityLinks(): Promise<IdentityProviderLink[]> {
  const { data, error } = await db.from("identity_provider_links")
    .select("*, provider_families(name, provider_key)")
    .order("created_at");
  if (error) throw error;
  return data ?? [];
}

export async function getPrimaryIdentity(): Promise<IdentityProviderLink | null> {
  const { data, error } = await db.from("identity_provider_links")
    .select("*, provider_families(name, provider_key)")
    .eq("primary_identity", true)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// ── Identity methods view ──────────────────────────────────────
export async function getIdentityMethods(): Promise<IdentityMethodView[]> {
  const { data, error } = await db.from("v_identity_methods")
    .select("*");
  if (error) throw error;
  return (data ?? []) as never as IdentityMethodView[];
}

// ── Session audit ──────────────────────────────────────────────
export async function logSessionEvent(event: IdentitySessionAuditInsert): Promise<void> {
  const { error } = await db.from("identity_session_audit")
    .insert(event);
  if (error) throw error;
}

export async function getSessionAuditLog(limit = 50): Promise<IdentitySessionAudit[]> {
  const { data, error } = await db.from("identity_session_audit")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

