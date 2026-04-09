import { FileCheck, Download, ChevronRight, Target, Shield, Brain, RefreshCw } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { DEMO_RECEIPTS } from "@/lib/demo-data/investment";



interface Receipt {
  id: string;
  type: "trade" | "approval" | "thesis" | "risk-change" | "rebalance" | "advisor-snapshot";
  title: string;
  description: string;
  timestamp: string;
  actor: string;
  status: "completed" | "approved" | "rejected" | "pending";
  metadata: Record<string, string>;
}

const TYPE_ICONS: Record<string, typeof Target> = { trade: Target, approval: Shield, thesis: Brain, "risk-change": Shield, rebalance: RefreshCw, "advisor-snapshot": Brain };
const TYPE_COLORS: Record<string, string> = { trade: "bg-primary/10 text-primary", approval: "bg-[hsl(var(--trust-safe))]/10 text-[hsl(var(--trust-safe))]", thesis: "bg-accent/10 text-accent", "risk-change": "bg-[hsl(var(--trust-warn))]/10 text-[hsl(var(--trust-warn))]", rebalance: "bg-secondary text-muted-foreground", "advisor-snapshot": "bg-primary/10 text-primary" };
const STATUS_COLORS: Record<string, string> = { completed: "text-[hsl(var(--trust-safe))]", approved: "text-[hsl(var(--trust-safe))]", rejected: "text-destructive", pending: "text-[hsl(var(--trust-warn))]" };

export default function InvestmentReceipts() {
  const { isDemoMode } = useDataMode();
  const { user } = useAuth();

  const { data: realReceipts } = useQuery({
    queryKey: ["investment-receipts", user?.id],
    enabled: !!user && !isDemoMode,
    queryFn: async () => {
      const { data } = await fromTable("proof_records").select("*").eq("user_id", user!.id).eq("domain", "investment").order("created_at", { ascending: false }).limit(50);
      if (!data?.length) return null;
      return data.map((r: Record<string, any>) => ({
        id: r.id,
        type: (r.metadata?.type || r.action || "trade") as Receipt["type"],
        title: r.metadata?.title || r.action || "Investment Action",
        description: r.metadata?.description || "",
        timestamp: r.created_at,
        actor: r.actor || "User",
        status: (r.outcome || "completed") as Receipt["status"],
        metadata: r.metadata?.details || {},
      }));
    },
  });

  const receipts = isDemoMode ? DEMO_RECEIPTS : (realReceipts ?? DEMO_RECEIPTS);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <DemoModeBadge />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><FileCheck className="h-6 w-6 text-primary" /> Decision History & Receipts</h1>
          <p className="text-sm text-muted-foreground mt-1">Complete professional record of decisions, reasoning, and execution</p>
        </div>
        <button className="rounded-xl bg-secondary px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors">
          <Download className="h-3.5 w-3.5" /> Export All
        </button>
      </div>

      <div className="space-y-3">
        {receipts.map(receipt => {
          const Icon = TYPE_ICONS[receipt.type] || Target;
          return (
            <div key={receipt.id} className="rounded-2xl border border-border bg-card p-5 space-y-3 hover:border-primary/15 transition-all">
              <div className="flex items-start gap-3">
                <div className={`rounded-xl p-2 ${TYPE_COLORS[receipt.type]}`}><Icon className="h-4 w-4" /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-foreground">{receipt.title}</h3>
                    <span className={`text-[9px] font-medium capitalize ${STATUS_COLORS[receipt.status]}`}>{receipt.status}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{receipt.description}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] text-muted-foreground">{new Date(receipt.timestamp).toLocaleDateString()}</p>
                  <p className="text-[9px] text-muted-foreground">{new Date(receipt.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-secondary/20 p-3 grid grid-cols-2 md:grid-cols-3 gap-2">
                {Object.entries(receipt.metadata).map(([k, v]) => (
                  <div key={k}>
                    <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{k}</p>
                    <p className="text-[11px] font-medium text-foreground">{String(v)}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">Actor: {receipt.actor}</span>
                <span className="rounded-full bg-secondary px-2 py-0.5 text-[9px] text-muted-foreground capitalize">{receipt.type.replace("-", " ")}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
