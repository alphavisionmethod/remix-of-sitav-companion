import { SitaPageHeader, SitaCard, SitaCardTitle, SitaButton } from "@/components/sita/SitaCard";
import { KPITile, EmptyState, SitaTabs } from "@/components/sita/SitaComponents";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
const db: any = supabase;
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Brain, Shield, Zap, Eye, Settings, ToggleLeft, ToggleRight, ChevronRight, Plus, Sparkles } from "lucide-react";

const AdvisorRegistry = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [domain, setDomain] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: advisors = [], isLoading } = useQuery({
    queryKey: ["advisor_registry", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await db.from("advisor_registry").select("*").order("created_at");
      if (error) throw error;
      return data;
    },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await db.from("advisor_registry").update({ active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["advisor_registry"] }); toast.success("Advisor updated"); },
  });

  const domains = ["all", ...new Set(advisors.map(a => a.domain))];
  const filtered = domain === "all" ? advisors : advisors.filter(a => a.domain === domain);
  const selected = advisors.find(a => a.id === selectedId);
  const activeCount = advisors.filter(a => a.active).length;

  // Also pull from advisor_configs for existing configs
  const { data: configs = [] } = useQuery({
    queryKey: ["advisor_configs", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await db.from("advisor_configs").select("*").order("created_at");
      if (error) throw error;
      return data;
    },
  });

  return (
    <motion.div className="mx-auto max-w-6xl space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <SitaPageHeader title="Advisor Registry" subtitle="All advisors — capabilities, trust thresholds, and orchestration" />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KPITile label="Registered Advisors" value={advisors.length} icon={Brain} />
        <KPITile label="Active" value={activeCount} icon={Zap} />
        <KPITile label="Advisor Configs" value={configs.length} icon={Settings} />
        <KPITile label="Domains" value={domains.length - 1} icon={Shield} />
      </div>

      <SitaTabs
        tabs={domains.map((d: string) => ({ key: d, label: d === "all" ? "All" : d.charAt(0).toUpperCase() + d.slice(1), count: d === "all" ? advisors.length : advisors.filter((a: any) => a.domain === d).length }))}
        active={domain}
        onChange={setDomain}
      />

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Brain} title="No advisors registered" description="Register advisors to enable multi-advisor orchestration and governance." />
      ) : (
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3 space-y-2">
            {filtered.map((adv, i) => (
              <motion.div key={adv.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <SitaCard selected={selectedId === adv.id} onClick={() => setSelectedId(adv.id)} className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${adv.active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                        {adv.display_name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">{adv.display_name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{adv.domain} · {adv.advisor_type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrustBadge level={adv.active ? "safe" : "low-confidence"} label={adv.active ? "Active" : "Inactive"} size="sm" />
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleActive.mutate({ id: adv.id, active: !adv.active }); }}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {adv.active ? <ToggleRight className="h-5 w-5 text-primary" /> : <ToggleLeft className="h-5 w-5" />}
                      </button>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </SitaCard>
              </motion.div>
            ))}
          </div>

          <div className="lg:col-span-2 space-y-4">
            {selected ? (
              <>
                <SitaCard hover={false} glow className="p-5">
                  <SitaCardTitle sub={`${selected.domain} · ${selected.advisor_type}`}>{selected.display_name}</SitaCardTitle>
                  <div className="mt-4 space-y-3">
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Trust Threshold</span><span className="text-foreground">{Math.round(Number(selected.trust_threshold) * 100)}%</span></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Explanation Style</span><span className="text-foreground capitalize">{selected.explanation_style}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Memory Scope</span><span className="text-foreground capitalize">{selected.memory_scope}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Status</span><TrustBadge level={selected.active ? "verified" : "low-confidence"} label={selected.active ? "Active" : "Inactive"} size="sm" /></div>
                  </div>
                </SitaCard>

                <SitaCard hover={false}>
                  <SitaCardTitle>Capabilities</SitaCardTitle>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {(selected.capabilities as string[])?.length > 0 ? (selected.capabilities as string[]).map((cap, i) => (
                      <span key={i} className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">{cap}</span>
                    )) : <p className="text-xs text-muted-foreground">No capabilities defined</p>}
                  </div>
                </SitaCard>

                <SitaCard hover={false}>
                  <SitaCardTitle>Tool Access</SitaCardTitle>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {(selected.tool_access as string[])?.length > 0 ? (selected.tool_access as string[]).map((tool, i) => (
                      <span key={i} className="rounded-md bg-accent/10 px-2 py-0.5 text-[11px] font-medium text-accent">{tool}</span>
                    )) : <p className="text-xs text-muted-foreground">No tool access configured</p>}
                  </div>
                </SitaCard>
              </>
            ) : (
              <EmptyState icon={Eye} title="Select an advisor" description="Click on an advisor to view capabilities, trust thresholds, and configuration" />
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default AdvisorRegistry;
