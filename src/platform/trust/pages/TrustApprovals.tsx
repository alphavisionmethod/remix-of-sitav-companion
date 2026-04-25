// ════════════════════════════════════════════════════════════
// Trust Center — Live Approvals (Phase 3)
// ════════════════════════════════════════════════════════════
// Reads pending approval requests from approval_requests so the
// Trust pillar has a self-contained authority surface. The legacy
// /approvals route remains for the boardroom flow.

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckSquare, ExternalLink, ShieldAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type ApprovalRow = {
  id: string;
  action_key: string;
  domain: string | null;
  status: string;
  risk_tier: string | null;
  justification: string | null;
  impact_summary: string | null;
  created_at: string;
};

export default function TrustApprovals() {
  const [rows, setRows] = useState<ApprovalRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await (supabase as unknown as {
        from: (t: string) => {
          select: (s: string) => {
            order: (
              col: string,
              opts: { ascending: boolean },
            ) => { limit: (n: number) => Promise<{ data: ApprovalRow[] | null }> };
          };
        };
      })
        .from("approval_requests")
        .select("id, action_key, domain, status, risk_tier, justification, impact_summary, created_at")
        .order("created_at", { ascending: false })
        .limit(50);
      if (!cancelled) {
        setRows(data ?? []);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-4">
      <header className="flex items-center gap-3">
        <CheckSquare className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-semibold">Approvals</h1>
          <p className="text-muted-foreground text-sm">
            Actions across all four pillars that need your authority.
          </p>
        </div>
        <Link
          to="/approvals"
          className="ml-auto inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          Boardroom view <ExternalLink className="h-3 w-3" />
        </Link>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pending & recent</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading…</div>
          ) : rows.length === 0 ? (
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <ShieldAlert className="h-4 w-4" /> No approval requests yet.
            </div>
          ) : (
            <ul className="divide-y">
              {rows.map((r) => (
                <li key={r.id} className="py-2 flex items-center gap-3">
                  <Badge
                    variant={r.status === "pending" ? "default" : "secondary"}
                    className="capitalize"
                  >
                    {r.status}
                  </Badge>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">{r.action_key}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {r.domain ?? "shared"} · {r.justification ?? "—"}
                    </div>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {r.risk_tier ?? "medium"}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}