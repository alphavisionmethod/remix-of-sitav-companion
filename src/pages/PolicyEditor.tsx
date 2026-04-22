import { useAction } from "@/hooks/use-action";
import { SitaPageHeader, SitaCard, SitaCardTitle, SitaButton } from "@/components/sita/SitaCard";
import { SectionSkeleton } from "@/components/sita/SectionSkeleton";
import { KPITile, EmptyState, SitaTabs } from "@/components/sita/SitaComponents";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Shield, Plus, Edit, Trash2, ToggleLeft, ToggleRight, ChevronRight, Play, AlertTriangle, FileText, Lock } from "lucide-react";
import { DEMO_CORE_CATEGORIES_POLICY_EDITOR as DEMO_CATEGORIES } from "@/data/seed/core-pages";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { useDraftAutosave } from "@/hooks/useDraftAutosave";
import { useEffect } from "react";
import { useDataMode } from "@/contexts/DataModeContext";

const PolicyEditor = () => {
  const { isDemoMode } = useDataMode();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [category, setCategory] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  type PolicyDraft = { newName: string; newCategory: string; newApproval: boolean };
  const { draft, updateDraft, clearDraft } = useDraftAutosave<PolicyDraft>("system:policy:new", "system");
  const [newName, setNewName] = useState(draft.newName ?? "");
  const [newCategory, setNewCategory] = useState(draft.newCategory ?? "general");
  const [newApproval, setNewApproval] = useState(draft.newApproval ?? true);
  useEffect(() => { updateDraft({ newName, newCategory, newApproval }); }, [newName, newCategory, newApproval, updateDraft]);

  const { data: policies = [], isLoading } = useQuery({
    queryKey: ["policies", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await fromTable("policies").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createPolicy = useAction("system", "policy.create");

  const togglePolicy = useAction("system", "policy.toggle", {
    invalidateKeys: [["policies"]],
  });

  const deletePolicy = useAction("system", "policy.delete", {
    invalidateKeys: [["policies"]],
  });

  const filtered = category === "all" ? policies : policies.filter(p => p.category === category);
  const selected = policies.find(p => p.id === selectedId);
  const activeCount = policies.filter(p => p.active).length;

  return (
    <motion.div className="mx-auto max-w-6xl space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
<SitaPageHeader
        title="Policy Engine"
        subtitle="Define rules, conditions, and approval gates for SITA's actions"
        actions={<SitaButton variant="primary" onClick={() => setShowCreate(true)}><Plus className="h-4 w-4" /> New Policy</SitaButton>}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KPITile label="Total Policies" value={policies.length} icon={Shield} />
        <KPITile label="Active" value={activeCount} icon={ToggleRight} />
        <KPITile label="Require Approval" value={policies.filter(p => p.approval_required).length} icon={Lock} />
        <KPITile label="Categories" value={new Set(policies.map(p => p.category)).size} icon={FileText} />
      </div>

      <SitaTabs
        tabs={[{ key: "all", label: "All", count: policies.length }, ...DEMO_CATEGORIES.map(c => ({ key: c, label: c.charAt(0).toUpperCase() + c.slice(1), count: policies.filter(p => p.category === c).length }))]}
        active={category}
        onChange={setCategory}
      />

      {showCreate && (
        <SitaCard hover={false} glow className="p-5">
          <SitaCardTitle>Create Policy</SitaCardTitle>
          <div className="mt-3 space-y-3">
            <input className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-2.5 text-sm text-foreground" placeholder="Policy name" value={newName} onChange={e => setNewName(e.target.value)} />
            <select className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-2.5 text-sm text-foreground" value={newCategory} onChange={e => setNewCategory(e.target.value)}>
              {DEMO_CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input type="checkbox" checked={newApproval} onChange={e => setNewApproval(e.target.checked)} className="rounded border-border" />
              Requires manual approval
            </label>
            <div className="flex gap-2">
              <SitaButton variant="primary" onClick={async () => { await createPolicy.mutate({ name: newName, category: newCategory, approval_required: newApproval, conditions: [], actions: [] }); clearDraft(); setNewName(""); setShowCreate(false); }}>Create</SitaButton>
              <SitaButton variant="secondary" onClick={() => setShowCreate(false)}>Cancel</SitaButton>
            </div>
          </div>
        </SitaCard>
      )}

      {isLoading ? (
        <SectionSkeleton cards={3} columns={1} />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Shield} title="No policies found" description="Create policies to govern SITA's actions, spending limits, and approval workflows." />
      ) : (
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3 space-y-2">
            {filtered.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <SitaCard selected={selectedId === p.id} onClick={() => setSelectedId(p.id)} className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Shield className={`h-4 w-4 shrink-0 ${p.active ? "text-primary" : "text-muted-foreground"}`} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">{p.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{p.category}{p.approval_required ? " · Approval required" : ""}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={e => { e.stopPropagation(); togglePolicy.mutate({ id: p.id, active: !p.active }); }} className="text-muted-foreground hover:text-foreground">
                        {p.active ? <ToggleRight className="h-5 w-5 text-primary" /> : <ToggleLeft className="h-5 w-5" />}
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
                  <SitaCardTitle sub={selected.category}>{selected.name}</SitaCardTitle>
                  <div className="mt-4 space-y-3">
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Status</span><TrustBadge level={selected.active ? "verified" : "low-confidence"} label={selected.active ? "Active" : "Inactive"} size="sm" /></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Approval</span><span className="text-foreground">{selected.approval_required ? "Required" : "Auto-approve"}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Conditions</span><span className="text-foreground">{(selected.conditions as never[]).length} rules</span></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Actions</span><span className="text-foreground">{(selected.actions as never[]).length} actions</span></div>
                  </div>
                </SitaCard>

                <SitaCard hover={false}>
                  <SitaCardTitle>Conditions</SitaCardTitle>
                  <div className="mt-2">
                    {(selected.conditions as never[]).length > 0 ? (
                      <div className="space-y-1">
                        {(selected.conditions as Array<Record<string, unknown>>).map((c, i) => (
                          <div key={i} className="rounded-lg bg-secondary/40 p-2 text-xs text-foreground">{JSON.stringify(c)}</div>
                        ))}
                      </div>
                    ) : <p className="text-xs text-muted-foreground">No conditions set — add conditions to control when this policy applies.</p>}
                  </div>
                </SitaCard>

                <div className="flex gap-2">
                  <SitaButton variant="accent" className="flex-1"><Play className="h-3.5 w-3.5" /> Simulate</SitaButton>
                  <SitaButton variant="danger" onClick={() => deletePolicy.mutate({ id: selected.id })}><Trash2 className="h-3.5 w-3.5" /> Delete</SitaButton>
                </div>
              </>
            ) : (
              <EmptyState icon={Shield} title="Select a policy" description="Click a policy to view details, conditions, and simulate" />
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default PolicyEditor;
