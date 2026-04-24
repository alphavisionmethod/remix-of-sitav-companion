// ═══════════════════════════════════════════════════════════════
// SITA OS — Advisor Context Loader
//
// Resolves the structured context an advisor needs from the
// database/storage layer, based on its declared `contextSources`.
// Returns a typed snapshot the advisor runtime hands to the model.
//
// IMPORTANT: All loaders are user-scoped (RLS enforced). When a
// source is unavailable the loader returns an explicit empty record
// rather than mock data — empty-state honesty is required.
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import {
  getBusinessAdvisor,
  type BusinessAdvisorId,
  type BusinessAdvisorManifest,
} from "./business-advisor-registry";

export interface AdvisorContextSlice {
  source: string;
  available: boolean;
  itemCount: number;
  lastUpdatedAt: string | null;
  sample: unknown[];
  notes?: string;
}

export interface AdvisorContextSnapshot {
  advisorId: BusinessAdvisorId;
  loadedAt: string;
  userId: string;
  slices: AdvisorContextSlice[];
  totalAvailable: number;
  totalRequested: number;
  coveragePct: number;
}

const SOURCE_TO_TABLE: Record<string, { table: string; label?: string } | null> = {
  // Sales — Phase 1 wired to real CRM substrate
  crm_records: { table: "crm_contacts", label: "CRM contacts" },
  leads: { table: "leads", label: "Sales leads" },
  pipeline: { table: "crm_opportunities", label: "Pipeline opportunities" },
  quotes: { table: "quotes", label: "Quotes" },
  offers: { table: "deals", label: "Active deals" },
  // Customer service
  support_tickets: null,
  customer_records: { table: "accounts" },
  sla_policies: null,
  // Finance
  financial_statements: null,
  budgets: null,
  transactions: null,
  forecasts: null,
  // Marketing
  campaigns: null,
  funnels: null,
  content_assets: null,
  audience_data: null,
  // Growth
  analytics: null,
  funnel_metrics: null,
  cohorts: null,
  experiments: null,
  // Tech
  product_roadmap: null,
  tech_stack: null,
  architecture_docs: null,
  incidents: null,
  // Imports/Exports
  trade_records: null,
  logistics: null,
  supplier_data: null,
  customs_docs: null,
  // Taxes/Laws
  tax_documents: null,
  jurisdiction_data: null,
  compliance_records: null,
  // CEO
  all_advisor_outputs: { table: "advisor_board_recommendations" },
  business_metrics: null,
  goals: null,
  decisions_log: { table: "advisor_board_actions" },
};

async function loadSlice(
  source: string,
  userId: string,
): Promise<AdvisorContextSlice> {
  const mapping = SOURCE_TO_TABLE[source] ?? null;
  if (!mapping) {
    return {
      source,
      available: false,
      itemCount: 0,
      lastUpdatedAt: null,
      sample: [],
      notes: "No data table wired for this source yet",
    };
  }

  try {
    // Use type-safe table queries; cast to any only at the boundary because
    // SOURCE_TO_TABLE is a string-driven dispatcher. RLS guarantees scoping.
    const tableName = mapping.table as
      | "accounts"
      | "advisor_board_recommendations"
      | "advisor_board_actions";
    const { data, error, count } = await supabase
      .from(tableName)
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) {
      return {
        source,
        available: false,
        itemCount: 0,
        lastUpdatedAt: null,
        sample: [],
        notes: error.message,
      };
    }

    const rows = (data ?? []) as Array<{ created_at?: string }>;
    return {
      source,
      available: (count ?? 0) > 0,
      itemCount: count ?? 0,
      lastUpdatedAt: rows[0]?.created_at ?? null,
      sample: rows.slice(0, 3),
    };
  } catch (err) {
    return {
      source,
      available: false,
      itemCount: 0,
      lastUpdatedAt: null,
      sample: [],
      notes: err instanceof Error ? err.message : "load failed",
    };
  }
}

export async function loadAdvisorContext(
  advisorId: BusinessAdvisorId,
  userId: string,
): Promise<AdvisorContextSnapshot> {
  const manifest: BusinessAdvisorManifest | undefined = getBusinessAdvisor(advisorId);
  if (!manifest) {
    throw new Error(`Unknown business advisor: ${advisorId}`);
  }

  const slices = await Promise.all(
    manifest.contextSources.map((source) => loadSlice(source, userId)),
  );
  const totalAvailable = slices.filter((s) => s.available).length;

  return {
    advisorId,
    loadedAt: new Date().toISOString(),
    userId,
    slices,
    totalAvailable,
    totalRequested: slices.length,
    coveragePct: slices.length === 0 ? 0 : (totalAvailable / slices.length) * 100,
  };
}