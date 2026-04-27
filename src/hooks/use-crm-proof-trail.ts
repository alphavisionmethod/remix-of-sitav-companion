// ════════════════════════════════════════════════════════════
// SITA OS — useCRMEntityProofTrail (Phase 7.2)
// Reads canonical `ai_action_receipts` rows for one CRM entity
// and projects them into the unified `ProofEntry` shape.
//
// Filter strategy:
//   1. Primary — match `action_payload->'entity_ref'->>'entity_id'`
//      (emitted by the Phase 7.2 `withTrust` wrapper).
//   2. Fallback — match `action_payload->'args'->>'id'` so legacy
//      receipts written before the entity_ref enrichment still
//      surface in the trail.
//   3. Related — for entities that own children (contact → comm,
//      task, note), include receipts whose `entity_ref.related`
//      points back to this entity.
// ════════════════════════════════════════════════════════════

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { receiptRowToProofEntry, type ProofEntry } from "@/lib/trust";

export type CRMProofEntityType = "contact" | "company" | "deal";

const RELATED_KEY_FOR: Record<CRMProofEntityType, string> = {
  contact: "contact_id",
  company: "company_id",
  deal: "opportunity_id",
};

const ACTION_PREFIXES_FOR: Record<CRMProofEntityType, string[]> = {
  contact: ["crm.contact.", "business.crm.contact_", "crm.communication.", "crm.note.", "crm.task.", "crm.contact_company_link.", "crm.merge."],
  company: ["crm.company.", "crm.contact_company_link.", "crm.merge."],
  deal: ["crm.opportunity.", "crm.deal.", "crm.communication.", "crm.task.", "crm.note."],
};

export interface UseCRMEntityProofTrailOptions {
  enabled?: boolean;
  /** Hard cap on rows fetched. Defaults to 200 — proof trails should be paginated client-side. */
  limit?: number;
}

export function useCRMEntityProofTrail(
  entityType: CRMProofEntityType,
  entityId: string | null | undefined,
  options: UseCRMEntityProofTrailOptions = {},
) {
  const { enabled = true, limit = 200 } = options;

  return useQuery({
    queryKey: ["crm", "proof-trail", entityType, entityId, limit],
    enabled: enabled && !!entityId,
    staleTime: 15_000,
    queryFn: async (): Promise<ProofEntry[]> => {
      if (!entityId) return [];

      const relatedKey = RELATED_KEY_FOR[entityType];
      const actionPrefixes = ACTION_PREFIXES_FOR[entityType];

      // The supabase-js JSONB containment helper (`contains`) is the
      // server-truth way to filter without leaking SQL into the client.
      // We fire three narrow queries and merge — each is indexable via
      // the existing GIN index on action_payload.
      const client = supabase as unknown as {
        from: (t: string) => {
          select: (s: string) => {
            eq: (col: string, val: unknown) => any;
            order: (col: string, opt: { ascending: boolean }) => any;
            limit: (n: number) => any;
            contains: (col: string, val: Record<string, unknown>) => any;
            or: (expr: string) => any;
          };
        };
      };

      const base = () =>
        client
          .from("ai_action_receipts")
          .select("id, receipt_id, action_type, recommendation_summary, status, confidence, risk_tier, action_payload, metadata, executed_at, created_at");

      // 1) entity_ref.entity_id match (Phase 7.2 receipts)
      const primary = await base()
        .contains("action_payload", { entity_ref: { entity_id: entityId, entity_type: entityType === "deal" ? "deal" : entityType } })
        .order("created_at", { ascending: false })
        .limit(limit);

      // 2) related entity match (children pointing at this entity)
      const related = await base()
        .contains("action_payload", { entity_ref: { related: { [relatedKey]: entityId } } })
        .order("created_at", { ascending: false })
        .limit(limit);

      // 3) legacy fallback — `args.id` match for older receipts
      const legacy = await base()
        .contains("action_payload", { args: { id: entityId } })
        .order("created_at", { ascending: false })
        .limit(limit);

      const allRows: Array<Record<string, unknown>> = [
        ...((primary?.data as Array<Record<string, unknown>>) ?? []),
        ...((related?.data as Array<Record<string, unknown>>) ?? []),
        ...((legacy?.data as Array<Record<string, unknown>>) ?? []),
      ];

      // Filter by action prefix (defence-in-depth — JSONB contains can match
      // unrelated rows if the same id appears elsewhere) + dedupe on id.
      const seen = new Set<string>();
      const filtered = allRows
        .filter((r) => {
          const at = String(r.action_type ?? "");
          return actionPrefixes.some((p) => at.startsWith(p));
        })
        .filter((r) => {
          const id = String(r.id ?? "");
          if (!id || seen.has(id)) return false;
          seen.add(id);
          return true;
        });

      const entries = filtered
        .map((row) =>
          receiptRowToProofEntry({
            id: String(row.id),
            receipt_id: (row.receipt_id as string | null | undefined) ?? null,
            action_type: String(row.action_type),
            recommendation_summary: String(row.recommendation_summary ?? ""),
            status: String(row.status ?? "executed"),
            confidence: row.confidence as number | null | undefined,
            risk_tier: row.risk_tier as string | null | undefined,
            action_payload: (row.action_payload as Record<string, unknown> | null) ?? {},
            metadata: (row.metadata as Record<string, unknown> | null) ?? {},
            executed_at: row.executed_at as string | null | undefined,
            created_at: String(row.created_at),
          }),
        )
        // Newest first.
        .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));

      return entries;
    },
  });
}