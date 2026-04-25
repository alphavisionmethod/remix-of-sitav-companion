import { useAction } from "@/hooks/use-action";
import { SitaPageHeader, SitaCard, SitaCardTitle, SitaSectionHeader, SitaButton } from "@/platform/sita/components/sita/SitaCard";
import { SectionSkeleton } from "@/platform/sita/components/sita/SectionSkeleton";
import { KPITile, SitaTabs, EmptyState } from "@/platform/sita/components/sita/SitaComponents";
import { TrustBadge } from "@/platform/sita/components/sita/TrustBadge";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { dbAny as db } from "@/lib/supabase-helpers";
import { fromTable } from "@/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Brain, Search, Edit, Trash2, Eye, Lock, Shield, Clock, Sparkles, X, Check, Save
} from "lucide-react";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { PageErrorState } from "@/platform/sita/components/sita/PageErrorState";



const categoryMap: Record<string, string> = {
  profile: "context",
  business: "business",
  money: "financial",
  household: "household",
  workflows: "workflow",
  preferences: "preference",
};

const MemoryCenter = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const tabs = [
    { key: "profile", label: "Profile" },
    { key: "business", label: "Business" },
    { key: "money", label: "Money" },
    { key: "household", label: "Household" },
    { key: "workflows", label: "Workflows" },
    { key: "preferences", label: "Preferences" },
  ];

  const activeTab = (() => {
    for (const t of tabs) {
      if (t.key !== "profile" && location.pathname.includes(`/memory/${t.key}`)) return t.key;
    }
    return "profile";
  })();

  const goTo = (key: string) => {
    if (key === "profile") navigate("/memory");
    else navigate(`/memory/${key}`);
  };

  // Live data from user_memory table
  const { data: allMemories = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["user_memory", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await db.from("user_memory")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Delete mutation
  const forgetMutation = useAction("system", "memory.forget", {
    invalidateKeys: [["user_memory"]],
  });

  // Update mutation
  const updateMutation = useAction("system", "memory.update", {
    invalidateKeys: [["user_memory"]],
  });

  // Filter by active tab category
  interface MemoryItem { id: string; key: string; value: unknown; category: string; source?: string; updated_at: string; expires_at?: string; confidence?: number; }
  const memories = allMemories as MemoryItem[];
  const dbCategory = categoryMap[activeTab] || "context";
  const tabMemories = memories.filter((m: Record<string, any>) => m.category === dbCategory);

  // Count per tab
  const countForTab = (key: string) => memories.filter((m: Record<string, any>) => m.category === (categoryMap[key] || "context")).length;

  // Search
  const filtered = search
    ? tabMemories.filter((m: Record<string, any>) => m.key?.toLowerCase().includes(search.toLowerCase()) || JSON.stringify(m.value).toLowerCase().includes(search.toLowerCase()))
    : tabMemories;

  const totalMemories = memories.length;
  const avgConfidence = memories.length > 0 ? Math.round(memories.reduce((s: number,  m: Record<string, any>) => s + (m.confidence || 0), 0) / memories.length * 100) : 0;
  const sensitiveCount = memories.filter((m: Record<string, any>) => m.category === "financial" || m.category === "household").length;
  const lastUpdated = allMemories[0]?.updated_at ? new Date(allMemories[0].updated_at).toLocaleString() : "—";

  const formatValue = (val: unknown): string => {
    if (typeof val === "string") return val;
    return JSON.stringify(val);
  };

  const timeSince = (date: string) => {
    const ms = Date.now() - new Date(date).getTime();
    const mins = Math.floor(ms / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  if (isError) {
    return (
      <motion.div className="mx-auto max-w-5xl space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <SitaPageHeader title="Memory Center" subtitle="Everything SITA knows — transparent, editable, and governed" />
        <PageErrorState onRetry={refetch} context="memories" />
      </motion.div>
    );
  }

  return (
    <motion.div className="mx-auto max-w-5xl space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
<SitaPageHeader title="Memory Center" subtitle="Everything SITA knows — transparent, editable, and governed" />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KPITile label="Total Memories" value={totalMemories} icon={Brain} />
        <KPITile label="Avg Confidence" value={`${avgConfidence}%`} icon={Sparkles} />
        <KPITile label="Sensitive Items" value={sensitiveCount} sub="Protected" icon={Lock} />
        <KPITile label="Last Updated" value={allMemories[0] ? timeSince(allMemories[0].updated_at) : "—"} icon={Clock} />
      </div>

      <div className="overflow-x-auto -mx-2 px-2">
        <SitaTabs tabs={tabs.map(t => ({ ...t, count: countForTab(t.key) }))} active={activeTab} onChange={goTo} />
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          className="w-full rounded-xl border border-border bg-secondary/40 pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
          placeholder="Search memories..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button onClick={() => setSearch("")} aria-label="Close" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isLoading ? (
        <SectionSkeleton cards={3} columns={1} />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Brain} title="No memories found" description={search ? "Try a different search term" : "SITA hasn't learned anything in this category yet. Interact with the OS to build memory."} />
      ) : (
        <div className="space-y-2">
          {filtered.map((m) => (
            <SitaCard key={m.id} hover={false} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {m.category === "financial" || m.category === "household" ? <Lock className="h-4 w-4 text-accent mt-0.5 shrink-0" /> : <Brain className="h-4 w-4 text-primary mt-0.5 shrink-0" />}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">{m.key}</p>
                    {editingId === m.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          className="flex-1 rounded-lg border border-primary/30 bg-secondary/40 px-3 py-1.5 text-sm text-foreground"
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          autoFocus
                        />
                        <button onClick={() => updateMutation.mutate({ id: m.id, value: editValue })} className="rounded-md p-1 text-primary hover:bg-primary/10"><Check className="h-4 w-4" /></button>
                        <button onClick={() => setEditingId(null)} aria-label="Close" className="rounded-md p-1 text-muted-foreground hover:bg-secondary"><X className="h-4 w-4" /></button>
                      </div>
                    ) : (
                      <p className="text-sm text-foreground">{formatValue(m.value)}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      {m.source && <span className="text-[11px] text-muted-foreground">{m.source}</span>}
                      <span className="text-[11px] text-muted-foreground">· {timeSince(m.updated_at)}</span>
                      {m.expires_at && (
                        <span className="text-[10px] text-accent">Expires {new Date(m.expires_at).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-12 rounded-full bg-secondary overflow-hidden">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${(m.confidence || 0) * 100}%` }} />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{Math.round((m.confidence || 0) * 100)}%</span>
                  </div>
                  <button
                    onClick={() => { setEditingId(m.id); setEditValue(formatValue(m.value)); }}
                    className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                    title="Edit"
                  >
                    <Edit className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => forgetMutation.mutate({ id: m.id })}
                    className="rounded-md p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    title="Forget"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </SitaCard>
          ))}
        </div>
      )}

      <SitaCard hover={false} className="p-5 gradient-sita-subtle">
        <div className="flex items-center gap-3 mb-3">
          <Shield className="h-5 w-5 text-primary" />
          <SitaCardTitle>Memory Governance</SitaCardTitle>
        </div>
        <p className="text-xs text-muted-foreground mb-3">SITA's memory is transparent and under your control. You can edit, correct, or delete any memory at any time. Sensitive items are encrypted and access-controlled.</p>
        <div className="flex gap-2">
          <SitaButton variant="secondary" size="sm"><Eye className="h-3.5 w-3.5" /> Audit Log</SitaButton>
          <SitaButton variant="secondary" size="sm"><Lock className="h-3.5 w-3.5" /> Privacy Settings</SitaButton>
        </div>
      </SitaCard>
    </motion.div>
  );
};

export default MemoryCenter;
