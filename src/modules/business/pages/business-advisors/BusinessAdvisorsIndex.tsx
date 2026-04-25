// ═══════════════════════════════════════════════════════════════
// Business Advisors — Index / Catalog Page (OS surface)
// Lists all 9 Business System advisors with phase + readiness chips.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { BUSINESS_ADVISOR_LIST, type BusinessAdvisorId } from "@/lib/ai-platform/runtime";

interface DeploymentRow {
  advisor_id: string;
  phase: string;
  ready_score: number;
}

export default function BusinessAdvisorsIndex() {
  const [statuses, setStatuses] = useState<Record<string, DeploymentRow>>({});

  useEffect(() => {
    let cancelled = false;
    void supabase
      .from("advisor_deployment_status")
      .select("advisor_id, phase, ready_score")
      .in("advisor_id", BUSINESS_ADVISOR_LIST.map((a) => a.id))
      .then(({ data }) => {
        if (cancelled || !data) return;
        const map: Record<string, DeploymentRow> = {};
        for (const r of data) map[r.advisor_id] = r as DeploymentRow;
        setStatuses(map);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <header className="mb-6">
          <h1 className="text-3xl font-semibold tracking-tight">Business Advisors</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Nine specialised advisors covering sales, service, finance, marketing, growth, technology, trade, compliance, and executive synthesis.
          </p>
        </header>

        <div className="grid gap-3 sm:grid-cols-2">
          {BUSINESS_ADVISOR_LIST.map((advisor) => {
            const dep = statuses[advisor.id];
            const ready = dep ? Math.round(Number(dep.ready_score) * 100) : 0;
            return (
              <Link
                key={advisor.id}
                to={`/business-advisors/${advisor.id as BusinessAdvisorId}`}
                className="group"
              >
                <Card className="h-full transition-colors hover:border-primary/40">
                  <CardHeader>
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-base">{advisor.displayName}</CardTitle>
                      <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                    </div>
                    <CardDescription>{advisor.tagline}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant="outline" className="text-xs">{advisor.authority}</Badge>
                      <Badge variant={advisor.sensitive ? "destructive" : "secondary"} className="text-xs">
                        {advisor.riskTier} risk
                      </Badge>
                      {dep && (
                        <Badge variant="outline" className="text-xs">
                          {dep.phase} · {ready}%
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{advisor.mission}</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}