// ═══════════════════════════════════════════════════════════════
// SITA OS — Taxes & Laws Advisor compact header stats.
// Live, RLS-scoped tax/legal pulse: tax-flavoured docs, missing
// classification, sensitivity-flagged docs, and most recent activity.
// All counts come from real `file_metadata` rows scoped by RLS.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, AlertTriangle, ShieldAlert, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ProfessionalDisclaimerBanner } from "./ProfessionalDisclaimerBanner";

interface Stats {
  taxDocs: number;
  unclassifiedTaxDocs: number;
  sensitiveTaxDocs: number;
  lastDocAt: string | null;
}

export const TAX_DOC_PATTERNS = [
  "tax",
  "vat",
  "gst",
  "1099",
  "w-2",
  "w2",
  "w-9",
  "w9",
  "irs",
  "hmrc",
  "return",
  "deduction",
  "withholding",
  "legal",
  "contract",
  "nda",
  "license",
  "compliance",
  "regulation",
  "law",
  "statute",
] as const;

function buildTaxOr(): string {
  return TAX_DOC_PATTERNS
    .map((p) => `classification.ilike.%${p}%,filename.ilike.%${p}%`)
    .join(",");
}

export function TaxesLawsHeaderStats() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data: u } = await supabase.auth.getUser();
      const userId = u?.user?.id;
      if (!userId) return;
      const taxOr = buildTaxOr();

      const [taxRes, missingRes, sensitiveRes, lastRes] = await Promise.all([
        supabase
          .from("file_metadata")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .or(taxOr),
        supabase
          .from("file_metadata")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .or(taxOr)
          .is("classification", null),
        supabase
          .from("file_metadata")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .or(taxOr)
          .or("sensitivity.ilike.%confidential%,sensitivity.ilike.%restricted%,sensitivity.ilike.%pii%"),
        supabase
          .from("file_metadata")
          .select("created_at")
          .eq("user_id", userId)
          .or(taxOr)
          .order("created_at", { ascending: false })
          .limit(1),
      ]);

      if (cancelled) return;
      const lastRow = (lastRes.data ?? []) as Array<{ created_at: string }>;
      setStats({
        taxDocs: taxRes.count ?? 0,
        unclassifiedTaxDocs: missingRes.count ?? 0,
        sensitiveTaxDocs: sensitiveRes.count ?? 0,
        lastDocAt: lastRow[0]?.created_at ?? null,
      });
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  if (!stats) {
    return (
      <div className="space-y-2">
        <ProfessionalDisclaimerBanner variant="compact" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      </div>
    );
  }

  const items = [
    { icon: FileText, label: "Tax/legal docs", value: String(stats.taxDocs) },
    { icon: AlertTriangle, label: "Unclassified", value: String(stats.unclassifiedTaxDocs) },
    { icon: ShieldAlert, label: "Sensitive", value: String(stats.sensitiveTaxDocs) },
    {
      icon: Clock,
      label: "Last doc",
      value: stats.lastDocAt ? new Date(stats.lastDocAt).toLocaleDateString() : "—",
    },
  ];

  return (
    <div className="space-y-2">
      <ProfessionalDisclaimerBanner variant="compact" />
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
    </div>
  );
}