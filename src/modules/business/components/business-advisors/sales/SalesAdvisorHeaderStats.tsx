// ═══════════════════════════════════════════════════════════════
// SITA OS — Sales Advisor compact header stats strip.
// Shows live counts pulled from the user's CRM (RLS-scoped).
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, GitBranch, FileText, Receipt } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Stats {
  leads: number;
  openOpps: number;
  openQuotes: number;
  contacts: number;
}

export function SalesAdvisorHeaderStats() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data: u } = await supabase.auth.getUser();
      const userId = u?.user?.id;
      if (!userId) return;
      const [leadsCnt, oppsCnt, quotesCnt, contactsCnt] = await Promise.all([
        supabase.from("leads").select("id", { count: "exact", head: true }).eq("user_id", userId),
        supabase
          .from("crm_opportunities")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .not("status", "in", "(won,lost,closed)"),
        supabase
          .from("quotes")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .in("status", ["draft", "pending"]),
        supabase.from("crm_contacts").select("id", { count: "exact", head: true }).eq("user_id", userId),
      ]);
      if (cancelled) return;
      setStats({
        leads: leadsCnt.count ?? 0,
        openOpps: oppsCnt.count ?? 0,
        openQuotes: quotesCnt.count ?? 0,
        contacts: contactsCnt.count ?? 0,
      });
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  if (!stats) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16" />)}
      </div>
    );
  }

  const items = [
    { icon: Users, label: "Leads", value: stats.leads },
    { icon: GitBranch, label: "Open opps", value: stats.openOpps },
    { icon: FileText, label: "Open quotes", value: stats.openQuotes },
    { icon: Receipt, label: "Contacts", value: stats.contacts },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {items.map((it) => {
        const Icon = it.icon;
        return (
          <Card key={it.label} className="p-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{it.label}</p>
                <p className="text-lg font-semibold">{it.value}</p>
              </div>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
          </Card>
        );
      })}
    </div>
  );
}