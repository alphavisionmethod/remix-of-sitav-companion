// ═══════════════════════════════════════════════════════════════
// SITA OS — CouncilPanel (Jarvis Bridge)
// Surfaces top advisor recommendations + their pre-vote dissent
// signals. Reads advisor_board_recommendations directly so it
// stays in sync with the existing boardroom surfaces.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { Users, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PremiumEmptyState } from "@/components/sita/PremiumEmptyState";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface CouncilRow {
  id: string;
  advisor_id: string;
  title: string;
  summary: string;
  rationale: string;
  domain: string;
  confidence_score: number;
  contributing_advisors: unknown[] | null;
  created_at: string;
}

export function CouncilPanel() {
  const { user } = useAuth();
  const [rows, setRows] = useState<CouncilRow[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    if (!user?.id) return;
    setLoading(true);
    const { data } = await supabase
      .from("advisor_board_recommendations" as never)
      .select("id, advisor_id, title, summary, rationale, domain, confidence_score, contributing_advisors, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5);
    setRows((data as unknown as CouncilRow[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { void refresh(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [user?.id]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" /> Council
        </CardTitle>
        <Button size="sm" variant="ghost" onClick={() => void refresh()} aria-label="Refresh council">
          <RefreshCw className="h-3.5 w-3.5" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {loading ? (
          <Skeleton className="h-20 w-full" />
        ) : rows.length === 0 ? (
          <PremiumEmptyState
            variant="no-data"
            title="No recommendations yet"
            description="The advisor council will surface recommendations here once they have enough signal."
          />
        ) : (
          rows.map((r) => {
            const dissent = Array.isArray(r.contributing_advisors)
              ? (r.contributing_advisors as Array<{ vote?: string }>).filter((a) => a?.vote === "dissent").length
              : 0;
            const consensus = Array.isArray(r.contributing_advisors)
              ? (r.contributing_advisors as Array<{ vote?: string }>).filter((a) => a?.vote === "consensus").length
              : 0;
            return (
              <div key={r.id} className="rounded-md border border-border/30 bg-card/40 p-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="font-medium text-sm leading-tight">{r.title}</div>
                  <Badge variant="outline" className="text-[10px]">{r.domain}</Badge>
                </div>
                {r.summary && <div className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{r.summary}</div>}
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <Badge variant="outline" className="text-[10px]">{r.advisor_id}</Badge>
                  <Badge variant="outline" className="text-[10px]">conf {(Number(r.confidence_score) * 100).toFixed(0)}%</Badge>
                  {consensus > 0 && <Badge variant="outline" className="text-[10px]">consensus {consensus}</Badge>}
                  {dissent > 0 && <Badge variant="destructive" className="text-[10px]">dissent {dissent}</Badge>}
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}