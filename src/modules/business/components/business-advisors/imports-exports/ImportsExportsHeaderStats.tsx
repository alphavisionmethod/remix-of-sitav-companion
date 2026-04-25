// ═══════════════════════════════════════════════════════════════
// SITA OS — Imports & Exports Advisor compact header stats.
// Live, RLS-scoped trade pulse: vendor contacts, recent trade docs,
// docs missing classification, and most recent doc activity.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Ship, FileText, AlertTriangle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Stats {
  vendorContacts: number;
  tradeDocs: number;
  missingClassification: number;
  lastDocAt: string | null;
}

const TRADE_DOC_PATTERNS = ["customs", "shipping", "trade", "import", "export", "bill of lading", "invoice"];

export function ImportsExportsHeaderStats() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data: u } = await supabase.auth.getUser();
      const userId = u?.user?.id;
      if (!userId) return;

      const tradeOr = TRADE_DOC_PATTERNS
        .map((p) => `classification.ilike.%${p}%,filename.ilike.%${p}%`)
        .join(",");

      const [vendorRes, tradeDocsRes, missingRes, lastDocRes] = await Promise.all([
        supabase
          .from("crm_contacts")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .or("source.ilike.%vendor%,source.ilike.%supplier%,tags.cs.{vendor},tags.cs.{supplier}"),
        supabase
          .from("file_metadata")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .or(tradeOr),
        supabase
          .from("file_metadata")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .is("classification", null),
        supabase
          .from("file_metadata")
          .select("created_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(1),
      ]);

      if (cancelled) return;
      const lastRow = (lastDocRes.data ?? []) as Array<{ created_at: string }>;
      setStats({
        vendorContacts: vendorRes.count ?? 0,
        tradeDocs: tradeDocsRes.count ?? 0,
        missingClassification: missingRes.count ?? 0,
        lastDocAt: lastRow[0]?.created_at ?? null,
      });
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!stats) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16" />
        ))}
      </div>
    );
  }

  const items = [
    { icon: Ship, label: "Vendors", value: String(stats.vendorContacts) },
    { icon: FileText, label: "Trade docs", value: String(stats.tradeDocs) },
    { icon: AlertTriangle, label: "Unclassified", value: String(stats.missingClassification) },
    {
      icon: Clock,
      label: "Last doc",
      value: stats.lastDocAt ? new Date(stats.lastDocAt).toLocaleDateString() : "—",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {items.map((it) => {
        const Icon = it.icon;
        return (
          <Card key={it.label} className="p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{it.label}</p>
                <p className="text-lg font-semibold truncate">{it.value}</p>
              </div>
              <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
            </div>
          </Card>
        );
      })}
    </div>
  );
}