// ═══════════════════════════════════════════════════════════════
// SITA OS — Quote Studio data hook
// Wires public.quotes (real RLS-protected table).
// Upsell suggestions / pricing insights have no backing table → [].
// ═══════════════════════════════════════════════════════════════
import { useQuery } from "@tanstack/react-query";
import { fromTable } from "@/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";

export interface QuoteRow {
  id: string;
  client: string;
  service: string;
  amount: number;
  status: string;
  sentAt: string | null;
  viewedAt: string | null;
  viewCount: number;
  expiresIn: string | null;
  followUp: string;
  objections?: string;
  aiInsight: string;
  discount?: string;
}

export interface QuoteStat {
  label: string;
  value: string;
  delta: string;
  color: string;
  icon: any;
}

function formatExpiresIn(expiresAt: string | null): string | null {
  if (!expiresAt) return null;
  const days = Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86400000);
  if (days < 0) return "Expired";
  if (days === 0) return "Today";
  if (days === 1) return "1 day";
  return `${days} days`;
}

export function useQuoteStudio() {
  const { user } = useAuth();
  const uid = user?.id ?? null;

  return useQuery({
    queryKey: ["quote-studio", uid],
    enabled: !!uid,
    queryFn: async (): Promise<{
      quotes: QuoteRow[];
      quoteStats: QuoteStat[];
      upsellSuggestions: never[];
      pricingInsights: never[];
    }> => {
      const { data = [] } = await fromTable("quotes")
        .select("id, title, amount_cents, currency, status, expires_at, line_items, metadata, created_at")
        .eq("user_id", uid!)
        .order("created_at", { ascending: false })
        .limit(100);

      const quotes: QuoteRow[] = (data ?? []).map((q: any) => ({
        id: q.id,
        client: q.metadata?.client_name ?? q.title,
        service: Array.isArray(q.line_items) && q.line_items[0]?.description ? q.line_items[0].description : q.title,
        amount: Math.round((q.amount_cents ?? 0) / 100),
        status: q.status,
        sentAt: q.metadata?.sent_at ?? null,
        viewedAt: q.metadata?.viewed_at ?? null,
        viewCount: q.metadata?.view_count ?? 0,
        expiresIn: formatExpiresIn(q.expires_at),
        followUp: q.metadata?.follow_up_state ?? "—",
        objections: q.metadata?.objections,
        aiInsight: q.metadata?.ai_insight ?? "",
        discount: q.metadata?.discount,
      }));

      const total = quotes.length;
      const accepted = quotes.filter((q) => q.status === "accepted").length;
      const sent = quotes.filter((q) => ["sent", "viewed", "accepted"].includes(q.status)).length;
      const totalValue = quotes.reduce((s, q) => s + q.amount, 0);
      const acceptRate = sent > 0 ? Math.round((accepted / sent) * 100) : 0;

      const quoteStats: QuoteStat[] =
        total === 0
          ? []
          : [
              { label: "Total Quotes", value: String(total), delta: "lifetime", color: "text-foreground", icon: null },
              { label: "Sent", value: String(sent), delta: "delivered", color: "text-blue-400", icon: null },
              { label: "Accept Rate", value: `${acceptRate}%`, delta: "accepted / sent", color: "text-emerald-400", icon: null },
              { label: "Pipeline Value", value: `$${totalValue.toLocaleString()}`, delta: "open + accepted", color: "text-foreground", icon: null },
            ];

      return { quotes, quoteStats, upsellSuggestions: [], pricingInsights: [] };
    },
  });
}