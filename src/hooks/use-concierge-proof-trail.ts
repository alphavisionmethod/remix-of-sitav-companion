// ════════════════════════════════════════════════════════════
// SITA OS — useConciergeProofTrail (Phase 7.4)
// Reads canonical `ai_action_receipts` rows for the concierge
// pillar and projects them into the unified `ProofEntry` shape.
//
// The hook supports two modes:
//   • Domain mode (no entityId): returns *all* recent concierge
//     receipts so /concierge/proof can show a system-wide audit trail.
//   • Entity mode (entityType + entityId): filters to receipts for
//     a specific concierge entity using the same three-query
//     strategy as `useCRMEntityProofTrail` — primary `entity_ref`,
//     related-id, and legacy `args.id` fallback.
// ════════════════════════════════════════════════════════════

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { receiptRowToProofEntry, type ProofEntry } from "@/lib/trust";

export type ConciergeProofEntityType =
  | "errand"
  | "grocery_list"
  | "grocery_item"
  | "gift"
  | "provider"
  | "appointment"
  | "automation"
  | "document"
  | "recurring_obligation";

const RELATED_KEY_FOR: Partial<Record<ConciergeProofEntityType, string>> = {
  grocery_list: "list_id",
  provider: "provider_id",
  appointment: "appointment_id",
  errand: "errand_id",
};

/**
 * The set of `action_type` prefixes that count as "concierge" for the
 * domain-level proof trail. Includes Phase 7.4 keys plus pre-existing
 * concierge keys (gift.purchase, reservation.cancel, contact.message,
 * household_task.assign, travel.booking_confirm).
 */
const CONCIERGE_ACTION_PREFIX = "concierge.";

export interface UseConciergeProofTrailOptions {
  enabled?: boolean;
  /** Hard cap on rows fetched. Defaults to 200. */
  limit?: number;
  /** When provided, restricts the trail to a single entity. */
  entityType?: ConciergeProofEntityType;
  entityId?: string | null;
}

interface ReceiptRow {
  id: string;
  receipt_id: string | null;
  action_type: string;
  recommendation_summary: string | null;
  status: string | null;
  confidence: number | null;
  risk_tier: string | null;
  action_payload: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  executed_at: string | null;
  created_at: string;
}

const SELECT_COLS =
  "id, receipt_id, action_type, recommendation_summary, status, confidence, risk_tier, action_payload, metadata, executed_at, created_at";

export function useConciergeProofTrail(
  options: UseConciergeProofTrailOptions = {},
): { data: ProofEntry[] | undefined; isLoading: boolean; error: unknown } {
  const { enabled = true, limit = 200, entityType, entityId } = options;
  const isEntityMode = !!entityType && !!entityId;

  const query = useQuery({
    queryKey: ["concierge", "proof-trail", entityType ?? "all", entityId ?? null, limit],
    enabled,
    staleTime: 15_000,
    queryFn: async (): Promise<ProofEntry[]> => {
      const client = supabase as unknown as {
        from: (t: string) => {
          select: (s: string) => {
            eq: (col: string, val: unknown) => any;
            order: (col: string, opt: { ascending: boolean }) => any;
            limit: (n: number) => any;
            contains: (col: string, val: Record<string, unknown>) => any;
            like: (col: string, val: string) => any;
          };
        };
      };

      const base = () => client.from("ai_action_receipts").select(SELECT_COLS);

      // ── Domain mode — all concierge receipts ────────────
      if (!isEntityMode) {
        const res = await base()
          .like("action_type", `${CONCIERGE_ACTION_PREFIX}%`)
          .order("created_at", { ascending: false })
          .limit(limit);
        const rows = ((res?.data as ReceiptRow[] | null) ?? []) as ReceiptRow[];
        return rowsToEntries(rows);
      }

      // ── Entity mode — three-query merge ─────────────────
      const relatedKey = RELATED_KEY_FOR[entityType!];

      const primary = await base()
        .contains("action_payload", {
          entity_ref: { entity_id: entityId!, entity_type: entityType! },
        })
        .order("created_at", { ascending: false })
        .limit(limit);

      const related = relatedKey
        ? await base()
            .contains("action_payload", {
              entity_ref: { related: { [relatedKey]: entityId! } },
            })
            .order("created_at", { ascending: false })
            .limit(limit)
        : { data: [] as ReceiptRow[] };

      const legacy = await base()
        .contains("action_payload", { args: { id: entityId! } })
        .order("created_at", { ascending: false })
        .limit(limit);

      const allRows: ReceiptRow[] = [
        ...((primary?.data as ReceiptRow[] | null) ?? []),
        ...((related?.data as ReceiptRow[] | null) ?? []),
        ...((legacy?.data as ReceiptRow[] | null) ?? []),
      ];

      // Defence-in-depth — JSONB contains can match unrelated rows if
      // the same id appears elsewhere. Restrict to concierge prefix +
      // dedupe on id.
      const seen = new Set<string>();
      const filtered = allRows.filter((r) => {
        const at = String(r.action_type ?? "");
        if (!at.startsWith(CONCIERGE_ACTION_PREFIX)) return false;
        const id = String(r.id ?? "");
        if (!id || seen.has(id)) return false;
        seen.add(id);
        return true;
      });

      return rowsToEntries(filtered);
    },
  });

  return { data: query.data, isLoading: query.isLoading, error: query.error };
}

function rowsToEntries(rows: ReceiptRow[]): ProofEntry[] {
  return rows
    .map((row) =>
      receiptRowToProofEntry({
        id: String(row.id),
        receipt_id: row.receipt_id ?? null,
        action_type: String(row.action_type),
        recommendation_summary: String(row.recommendation_summary ?? ""),
        status: String(row.status ?? "executed"),
        confidence: row.confidence,
        risk_tier: row.risk_tier,
        action_payload: row.action_payload ?? {},
        metadata: row.metadata ?? {},
        executed_at: row.executed_at,
        created_at: String(row.created_at),
      }),
    )
    .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
}
