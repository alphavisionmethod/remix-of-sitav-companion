import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Plus, DollarSign, CheckCircle, Send, X, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fromTable } from "@/lib/supabase-helpers";

import { HeroCard, SummaryCard, ActionCard, AdvisorCard } from "@/components/sita/cards";
import { ExecutionBadge } from "@/components/sita/badges";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { SitaTabs } from "@/components/sita/SitaComponents";
import { SitaCard, SitaCardTitle } from "@/components/sita/SitaCard";
import { SITA_TYPE } from "@/lib/design-system/sita-design-tokens";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useDataMode } from "@/contexts/DataModeContext";
import { useAction } from "@/hooks/use-action";

const QuotesWorkspace = () => {
  const { isDemoMode } = useDataMode();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", total: "", expiry_date: "", notes: "" });

  const { data: quotes = [], isLoading } = useQuery({
    queryKey: ["quotes", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await fromTable("quotes").select("*, customers(name)").eq("user_id", user.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const addQuote = useAction("business", "quote.create");
  const updateStatus = useAction("business", "status.update", { invalidateKeys: [["quotes"]] });
  const deleteQuote = useAction("business", "quote.delete", { invalidateKeys: [["quotes"]] });

  const selected = quotes.find((q: Record<string, any>) => q.id === selectedId);
  const filtered = tab === "all" ? quotes
    : tab === "active" ? quotes.filter((q: Record<string, any>) => !["accepted", "declined", "expired"].includes(q.status))
    : tab === "action" ? quotes.filter((q: Record<string, any>) => q.status === "draft" || q.status === "sent")
    : quotes.filter((q: Record<string, any>) => ["accepted", "declined", "expired"].includes(q.status));

  const totalValue = quotes.reduce((sum: number, q: Record<string, any>) => sum + (q.total || 0), 0);
  const activeCount = quotes.filter((q: Record<string, any>) => !["accepted", "declined", "expired"].includes(q.status)).length;

  return (
    <motion.div className="space-y-5" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <PageTruthBanner truthState={isDemoMode ? "demo" : "live"} />

      <HeroCard
        title="Quotes & Proposals"
        metric={totalValue > 0 ? `$${(totalValue / 1000).toFixed(0)}K pipeline` : "No quotes yet"}
        subtitle="Create, review, and track proposals"
        icon={<FileText className="h-5 w-5 text-[hsl(265_55%_68%)]" />}
      >
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[hsl(265_55%_58%/0.15)] hover:bg-[hsl(265_55%_58%/0.25)] text-[hsl(265_55%_68%)] text-[11px] font-medium transition-colors">
          <Plus className="h-3.5 w-3.5" /> New Quote
        </button>
      </HeroCard>

      <SummaryCard
        title="Pipeline"
        kpis={[
          { label: "Active Quotes", value: String(activeCount) },
          { label: "Total Value", value: totalValue > 0 ? `$${(totalValue / 1000).toFixed(0)}K` : "$0" },
          { label: "Drafts", value: String(quotes.filter((q: Record<string, any>) => q.status === "draft").length) },
          { label: "Accepted", value: String(quotes.filter((q: Record<string, any>) => q.status === "accepted").length), trend: "up" },
        ]}
      />

      {/* Add form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <div className="rounded-xl border border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_9%)] p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className={cn(SITA_TYPE.cardTitle, "text-[hsl(0_0%_85%)]")}>New Quote</span>
                <button onClick={() => setShowAdd(false)} className="text-[hsl(0_0%_50%)]"><X className="h-4 w-4" /></button>
              </div>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Quote title *" className="w-full rounded-lg border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_12%)] px-3 py-2 text-sm text-[hsl(0_0%_85%)] placeholder:text-[hsl(0_0%_40%)] focus:outline-none" />
              <div className="grid grid-cols-2 gap-3">
                <input type="number" value={form.total} onChange={e => setForm({ ...form, total: e.target.value })} placeholder="Total ($)" className="rounded-lg border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_12%)] px-3 py-2 text-sm text-[hsl(0_0%_85%)] focus:outline-none" />
                <input type="date" value={form.expiry_date} onChange={e => setForm({ ...form, expiry_date: e.target.value })} className="rounded-lg border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_12%)] px-3 py-2 text-sm text-[hsl(0_0%_85%)] focus:outline-none" />
              </div>
              <button onClick={() => { addQuote.mutate({ title: form.title.trim(), total: form.total ? parseFloat(form.total) : null, expiry_date: form.expiry_date || null, notes: form.notes || null, status: "draft" }); setShowAdd(false); }} disabled={!form.title.trim()} className="px-4 py-2 rounded-lg bg-[hsl(265_55%_58%)] text-white text-xs font-medium hover:bg-[hsl(265_55%_50%)] disabled:opacity-50 transition-colors">Create Quote</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SitaTabs tabs={[
        { key: "all", label: "All", count: quotes.length },
        { key: "active", label: "Active", count: activeCount },
        { key: "action", label: "Drafts & Sent", count: quotes.filter((q: Record<string, any>) => ["draft", "sent"].includes(q.status)).length },
        { key: "closed", label: "Closed" },
      ]} active={tab} onChange={setTab} />

      <div className="grid gap-5 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-2">
          {isLoading ? <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-16 rounded-xl bg-[hsl(0_0%_100%/0.03)] animate-pulse" />)}</div>
          : filtered.length === 0 ? (
            <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-8 text-center">
              <FileText className="h-6 w-6 text-[hsl(0_0%_40%)] mx-auto mb-2" />
              <p className={cn(SITA_TYPE.cardTitle, "text-[hsl(0_0%_70%)]")}>No quotes</p>
            </div>
          ) : filtered.map((q: Record<string, any>) => (
            <div key={q.id} onClick={() => setSelectedId(q.id)} className="cursor-pointer">
              <ActionCard
                title={q.title}
                description={`${q.customers?.name || "No customer"} · ${q.total ? `$${Number(q.total).toLocaleString()}` : "—"} · ${q.status}`}
                accentColor={q.status === "accepted" ? "hsl(152 55% 48%)" : q.status === "draft" ? "hsl(0 0% 50%)" : "hsl(265 55% 58%)"}
                badge={<ExecutionBadge state={q.status === "accepted" ? "complete" : q.status === "sent" ? "executing" : "drafted"} />}
              />
            </div>
          ))}
        </div>

        <div className="lg:col-span-2 space-y-4">
          {selected ? (
            <>
              <div className="rounded-xl border border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_9%)] p-5">
                <h4 className={cn(SITA_TYPE.cardTitle, "text-[hsl(0_0%_85%)] mb-1")}>{selected.title}</h4>
                <p className={cn(SITA_TYPE.metricEmphasis, "text-[hsl(0_0%_95%)]")}>{selected.total ? `$${Number(selected.total).toLocaleString()}` : "—"}</p>
                <p className={cn(SITA_TYPE.timelineMeta, "mt-1")}>{selected.customers?.name || "No customer"} · Created {new Date(selected.created_at).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-2">
                {selected.status === "draft" && <button onClick={() => updateStatus.mutate({ id: selected.id, status: "sent" })} className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-[hsl(265_55%_58%)] px-3 py-2 text-xs font-medium text-white"><Send className="h-3.5 w-3.5" /> Mark Sent</button>}
                {selected.status === "sent" && <button onClick={() => updateStatus.mutate({ id: selected.id, status: "accepted" })} className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-[hsl(152_55%_48%)] px-3 py-2 text-xs font-medium text-white"><CheckCircle className="h-3.5 w-3.5" /> Mark Accepted</button>}
                <button onClick={() => deleteQuote.mutate({ id: selected.id })} className="rounded-lg border border-[hsl(0_0%_100%/0.06)] px-3 py-2 text-xs text-[hsl(0_0%_50%)] hover:text-[hsl(0_70%_55%)] transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-8 text-center">
              <FileText className="h-6 w-6 text-[hsl(0_0%_40%)] mx-auto mb-2" />
              <p className={cn(SITA_TYPE.cardTitle, "text-[hsl(0_0%_70%)]")}>Select a quote</p>
            </div>
          )}
        </div>
      </div>

      <AdvisorCard
        advisorName="Quote Intelligence"
        domain="Business"
        insight="2 quotes are aging past 7 days without response — win rate drops 40% after 10 days. Consider a brief follow-up call or revised offer."
        confidence={78}
        accentColor="hsl(265 55% 58%)"
      />
    </motion.div>
  );
};

export default QuotesWorkspace;
