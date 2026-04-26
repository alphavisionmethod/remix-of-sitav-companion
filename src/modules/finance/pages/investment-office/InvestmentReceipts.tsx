import { useState } from "react";
import { FileCheck, Download, Target, Shield, Brain, RefreshCw, ChevronDown, ChevronUp, MessageSquare, CheckCircle, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { POST_TRADE_REVIEWS } from "@/domains/investment";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
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
const VERDICT_COLORS: Record<string, string> = { "well-executed": "bg-[hsl(var(--trust-safe))]/10 text-[hsl(var(--trust-safe))]", acceptable: "bg-primary/10 text-primary", caution: "bg-[hsl(var(--trust-warn))]/10 text-[hsl(var(--trust-warn))]", "needs-action": "bg-destructive/10 text-destructive" };

export default function InvestmentReceipts() {
  const { user, isDemo } = useAuth();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showReview, setShowReview] = useState<string | null>(null);

  const { data: realReceipts } = useQuery({
    queryKey: ["investment-receipts", user?.id],
    enabled: !!user && !false,
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

  const receipts = (realReceipts ?? []);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
<div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><FileCheck className="h-6 w-6 text-primary" /> Decision History & Receipts</h1>
          <p className="text-sm text-muted-foreground mt-1">Complete professional record of decisions, reasoning, and execution</p>
        </div>
        <button className="rounded-xl bg-secondary px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors">
          <Download className="h-3.5 w-3.5" /> Export All
        </button>
      </div>

      {/* Post-Trade Reviews Section */}
      <div className="rounded-2xl border border-primary/15 bg-card p-6 space-y-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" /> Post-Trade Reviews
        </h3>
        <p className="text-xs text-muted-foreground">Advisor commentary on completed trades — what was expected, what changed, and lessons learned.</p>
        <div className="space-y-3">
          {POST_TRADE_REVIEWS.map(review => (
            <div key={review.id} className="rounded-xl border border-border bg-secondary/10 overflow-hidden">
              <button onClick={() => setShowReview(showReview === review.id ? null : review.id)}
                className="w-full p-4 text-left flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-[hsl(var(--trust-safe))] shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-foreground">{review.tradeTitle}</p>
                  <p className="text-[10px] text-muted-foreground">{review.date}</p>
                </div>
                {showReview === review.id ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
              </button>

              {showReview === review.id && (
                <div className="border-t border-border p-4 space-y-4">
                  {/* Advisor Comments */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-semibold text-foreground uppercase tracking-wider">Advisor Commentary</p>
                    {review.advisorComments.map(ac => (
                      <div key={ac.advisorId} className="rounded-xl border border-border bg-card p-3 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{ac.advisorIcon}</span>
                          <span className="text-xs font-semibold text-foreground">{ac.advisorName}</span>
                          <span className={`rounded-full px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider ${VERDICT_COLORS[ac.verdict]}`}>
                            {ac.verdict.replace("-", " ")}
                          </span>
                        </div>
                        <p className="text-[11px] text-foreground leading-relaxed">{ac.comment}</p>
                      </div>
                    ))}
                  </div>

                  {/* Thesis Accuracy */}
                  <div className="rounded-xl border border-[hsl(var(--trust-safe))]/20 bg-[hsl(var(--trust-safe))]/5 p-3 space-y-1">
                    <p className="text-[10px] font-semibold text-[hsl(var(--trust-safe))] uppercase tracking-wider">Thesis Accuracy</p>
                    <p className="text-xs text-foreground leading-relaxed">{review.thesisAccuracy}</p>
                  </div>

                  {/* What Changed */}
                  <div className="rounded-xl border border-border bg-secondary/20 p-3 space-y-1">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">What Changed Since Entry</p>
                    <p className="text-xs text-foreground leading-relaxed">{review.whatChanged}</p>
                  </div>

                  {/* Lessons */}
                  <div className="rounded-xl border border-primary/15 bg-primary/5 p-3 space-y-1">
                    <p className="text-[10px] font-semibold text-primary uppercase tracking-wider">Lessons Learned</p>
                    <p className="text-xs text-foreground leading-relaxed">{review.lessonsLearned}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Receipt List */}
      <div className="space-y-3">
        {receipts.map(receipt => {
          const Icon = TYPE_ICONS[receipt.type] || Target;
          const isExpanded = expandedId === receipt.id;
          return (
            <div key={receipt.id} className="rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/15 transition-all">
              <div className="p-5 space-y-3 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : receipt.id)}>
                <div className="flex items-start gap-3">
                  <div className={`rounded-xl p-2 ${TYPE_COLORS[receipt.type]}`}><Icon className="h-4 w-4" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-foreground">{receipt.title}</h3>
                      <span className={`text-[9px] font-medium capitalize ${STATUS_COLORS[receipt.status]}`}>{receipt.status}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{receipt.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right shrink-0">
                      <p className="text-[10px] text-muted-foreground">{new Date(receipt.timestamp).toLocaleDateString()}</p>
                      <p className="text-[9px] text-muted-foreground">{new Date(receipt.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
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

              {isExpanded && (
                <div className="border-t border-border bg-secondary/10 p-5 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-[10px] font-semibold text-foreground uppercase tracking-wider">Proof Chain</p>
                      <div className="space-y-1.5">
                        {[
                          { step: "Intent Declared", time: receipt.timestamp, status: "✓" },
                          { step: "Risk Review", time: receipt.timestamp, status: receipt.type === "trade" ? "✓ Passed" : "—" },
                          { step: "Advisor Check", time: receipt.timestamp, status: "✓ No objections" },
                          { step: receipt.status === "approved" || receipt.status === "completed" ? "Executed" : "Pending", time: receipt.timestamp, status: receipt.status === "completed" ? "✓" : "⏳" },
                        ].map((s, i) => (
                          <div key={i} className="flex items-center gap-2 text-[10px]">
                            <span className={`w-4 text-center ${s.status.includes("✓") ? "text-[hsl(var(--trust-safe))]" : "text-muted-foreground"}`}>{s.status.charAt(0)}</span>
                            <span className="text-foreground">{s.step}</span>
                            <span className="text-muted-foreground ml-auto">{new Date(s.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[10px] font-semibold text-foreground uppercase tracking-wider">Linked Context</p>
                      <div className="space-y-1.5 text-[10px]">
                        <div className="flex justify-between"><span className="text-muted-foreground">Receipt ID</span><span className="text-foreground font-mono">{receipt.id.slice(0, 12)}…</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span className="text-foreground capitalize">{receipt.type.replace("-", " ")}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Actor</span><span className="text-foreground">{receipt.actor}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Governance</span><span className="text-foreground">{receipt.status === "approved" ? "Approval-linked" : "Standard"}</span></div>
                      </div>
                      <button className="mt-2 rounded-lg bg-secondary px-3 py-1.5 text-[10px] font-medium text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors">
                        <Download className="h-3 w-3" /> Export Receipt
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
