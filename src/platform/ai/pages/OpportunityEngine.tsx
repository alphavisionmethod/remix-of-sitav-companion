import { PageSkeleton } from "@/components/sita/PageSkeleton";
import { SitaPageHeader, SitaCard, SitaCardTitle, SitaSectionHeader, SitaButton } from "@/components/sita/SitaCard";
import { KPITile, EmptyState } from "@/components/sita/SitaComponents";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sparkles, DollarSign, Users, Clock, Briefcase, TrendingUp,
  ArrowRight, AlertTriangle, CreditCard, Home, Headphones
} from "lucide-react";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { PageShell } from "@/components/sita/PageShell";

const OpportunityEngine = () => {
  const { user } = useAuth();

  const { data: opportunities = [] } = useQuery({
    queryKey: ["opportunities", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await fromTable("opportunities").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: staleLeads = [] } = useQuery({
    queryKey: ["stale_leads", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await fromTable("leads").select("*").eq("stale_risk", true).order("last_contact_at");
      if (error) throw error;
      return data;
    },
  });

  const { data: overdueInvoices = [] } = useQuery({
    queryKey: ["overdue_invoices", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await fromTable("invoices").select("*").eq("status", "overdue").order("aging_days", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: underusedSubs = [] } = useQuery({
    queryKey: ["underused_subs", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await fromTable("subscriptions").select("*").lt("usage_score", 30).eq("status", "active");
      if (error) throw error;
      return data;
    },
  });

  const totalOpps = opportunities.length + staleLeads.length + overdueInvoices.length + underusedSubs.length;
  const pipelineValue = opportunities.reduce((s, o) => s + (Number(o.value) || 0), 0);
  const recoveryValue = overdueInvoices.reduce((s, i) => s + Number(i.amount) * 0.7, 0);
  const savingsValue = underusedSubs.reduce((s, sub) => s + Number(sub.amount) * 12, 0);

  const sections = [
    {
      domain: "Pipeline", icon: Briefcase, items: opportunities.map(o => ({
        title: o.title,
        desc: `Stage: ${o.stage} · Confidence: ${o.confidence}%${o.blockers ? ` · Blocker: ${o.blockers}` : ""}`,
        action: o.next_action || "Review",
        value: o.value ? `$${Number(o.value).toLocaleString()}` : "",
      })),
    },
    {
      domain: "Stale Leads", icon: Users, items: staleLeads.map(l => ({
        title: `Re-engage: ${l.name}`,
        desc: `Last contact: ${l.last_contact_at ? new Date(l.last_contact_at).toLocaleDateString() : "Never"}${l.likely_value ? ` · Est. value: $${l.likely_value}` : ""}`,
        action: l.next_action || "Follow up",
        value: l.likely_value ? `$${l.likely_value}` : "",
      })),
    },
    {
      domain: "Invoice Recovery", icon: DollarSign, items: overdueInvoices.map(inv => ({
        title: `Recover: ${inv.invoice_number}`,
        desc: `$${Number(inv.amount).toLocaleString()} overdue · ${inv.aging_days || 0} days`,
        action: "Escalate",
        value: `$${Math.round(Number(inv.amount) * 0.7).toLocaleString()} est. recovery`,
      })),
    },
    {
      domain: "Subscription Savings", icon: CreditCard, items: underusedSubs.map(sub => ({
        title: `Underused: ${sub.name}`,
        desc: `$${Number(sub.amount).toLocaleString()}/${sub.frequency} · Usage score: ${sub.usage_score}%`,
        action: "Review & Cancel",
        value: `$${Math.round(Number(sub.amount) * 12).toLocaleString()}/yr savings`,
      })),
    },
  ].filter(s => s.items.length > 0);

  return (
    <PageShell>
    <motion.div className="mx-auto max-w-5xl space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
<SitaPageHeader
        title="Opportunity Engine"
        subtitle="Cross-domain intelligence — what you're missing, what you could gain"
        actions={<SitaButton variant="accent"><Sparkles className="h-4 w-4" /> Scan Now</SitaButton>}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KPITile label="Active Opportunities" value={totalOpps} trend={totalOpps > 0 ? "up" : undefined} icon={Sparkles} />
        <KPITile label="Pipeline Value" value={`$${pipelineValue.toLocaleString()}`} icon={TrendingUp} />
        <KPITile label="Recovery Potential" value={`$${Math.round(recoveryValue).toLocaleString()}`} icon={DollarSign} />
        <KPITile label="Subscription Savings" value={`$${Math.round(savingsValue).toLocaleString()}/yr`} icon={CreditCard} />
      </div>

      {sections.length === 0 ? (
        <EmptyState icon={Sparkles} title="No opportunities detected" description="SITA scans leads, invoices, subscriptions, and pipeline data. Add data to see opportunities." />
      ) : (
        sections.map((section, di) => (
          <div key={di} className="space-y-3">
            <SitaSectionHeader title={section.domain} subtitle={`${section.items.length} opportunities detected`} />
            <div className="grid gap-3 sm:grid-cols-2">
              {section.items.map((item, ii) => (
                <motion.div key={ii} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (di * 3 + ii) * 0.04 }}>
                  <SitaCard className="p-4" lane="opportunity">
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-accent/10 p-2 shrink-0">
                        <section.icon className="h-4 w-4 text-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-foreground">{item.title}</p>
                          {item.value && <span className="text-[10px] font-semibold text-accent bg-accent/10 rounded-md px-1.5 py-0.5 shrink-0">{item.value}</span>}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{item.desc}</p>
                        <SitaButton variant="accent" size="sm" className="mt-3">
                          {item.action} <ArrowRight className="h-3 w-3" />
                        </SitaButton>
                      </div>
                    </div>
                  </SitaCard>
                </motion.div>
              ))}
            </div>
          </div>
        ))
      )}
    </motion.div>
    </PageShell>
  );
};

export default OpportunityEngine;
