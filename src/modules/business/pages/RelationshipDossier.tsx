import { useState } from "react";
import { motion } from "framer-motion";
import {
  Heart, Clock, Mail, Phone, FileText, Calendar, DollarSign,
  Shield, AlertTriangle, User as UserIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { LegacyEmptyStateCard as EmptyStateCard } from "@/platform/sita/components/sita/EmptyStateCard";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { useRelationshipDossier } from "@/platform/operations/hooks/use-operational-rituals";

const typeIcons: Record<string, React.ElementType> = {
  call: Phone, email: Mail, meeting: Calendar, deal: DollarSign, support: Shield, note: FileText, task: Clock,
};

export default function RelationshipDossier() {
  const [overrideId, setOverrideId] = useState<string | null>(null);
  const dossier = useRelationshipDossier(overrideId);
  const {
    contact, contacts, company, initials, health, healthBreakdown,
    lifetimeValueLabel, openDealCount, sinceLabel, lastContactLabel,
    nextFollowUpLabel, tags, timeline, linkedDeals,
    isLoading, isError, isEmpty,
  } = dossier;

  if (isError) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <EmptyStateCard
          icon={AlertTriangle}
          title="Couldn't load relationship dossier"
          description="One of the underlying CRM data sources failed. Please retry."
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-24 rounded-xl" />
        <div className="grid grid-cols-3 gap-5">
          <Skeleton className="h-64 rounded-xl col-span-2" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (isEmpty || !contact) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <EmptyStateCard
          icon={UserIcon}
          title="No contacts to dossier yet"
          description="Add a contact in your CRM to see a full relationship timeline, health score, and linked deals here."
          ctaLabel="Open CRM"
          ctaPath="/business/crm"
        />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 overflow-y-auto">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-[10px] uppercase tracking-[0.15em] text-foreground/40">Contact</label>
          <select
            value={contact.id}
            onChange={(e) => setOverrideId(e.target.value)}
            className="bg-[hsl(0_0%_100%/0.04)] border border-[hsl(0_0%_100%/0.08)] rounded-lg px-2 py-1 text-[11px] text-foreground/80"
          >
            {contacts.map((c) => (
              <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>
            ))}
          </select>
        </div>
        <PageTruthBanner />
      </div>

      {/* Hero card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
        className="rounded-2xl border border-[hsl(265_55%_58%/0.15)] bg-gradient-to-br from-[hsl(265_55%_58%/0.06)] to-[hsl(0_0%_100%/0.01)] p-6"
      >
        <div className="flex items-start gap-5">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[hsl(265_55%_58%)] to-[hsl(280_50%_45%)] flex items-center justify-center text-xl font-bold text-[hsl(0_0%_100%)] shadow-lg"
          >
            {initials}
          </motion.div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">{contact.first_name} {contact.last_name}</h1>
            <p className="text-xs text-foreground/40">
              {contact.title ?? "—"}
              {company?.name ? ` · ${company.name}` : ""}
            </p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {tags.map((tag) => (
                <span key={tag} className="text-[9px] px-2 py-0.5 rounded-full bg-[hsl(var(--sita-purple))]/10 text-[hsl(var(--sita-purple))] font-semibold">{tag}</span>
              ))}
            </div>
          </div>
          <div className="text-right space-y-1">
            <div className="flex items-center gap-1 justify-end">
              <Heart size={14} className={cn(health > 80 ? "text-[hsl(var(--trust-safe))]" : "text-[hsl(var(--sita-gold))]")} />
              <span className="text-lg font-bold text-foreground/90">{health}%</span>
            </div>
            <p className="text-[9px] text-foreground/25">Relationship Health</p>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-5 gap-3 mt-5">
          {[
            { label: "Lifetime Value", value: lifetimeValueLabel },
            { label: "Open Deals", value: `${openDealCount}` },
            { label: "Since", value: sinceLabel },
            { label: "Last Contact", value: lastContactLabel },
            { label: "Next Follow-Up", value: nextFollowUpLabel },
          ].map((s) => (
            <div key={s.label} className="rounded-lg bg-[hsl(0_0%_100%/0.04)] p-2.5">
              <p className="text-[9px] text-foreground/25 uppercase">{s.label}</p>
              <p className="text-[11px] font-semibold text-foreground/70 mt-0.5">{s.value}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Health breakdown */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-4"
      >
        <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-foreground/50 mb-3">Health Breakdown</h2>
        <div className="grid grid-cols-5 gap-3">
          {healthBreakdown.map((h) => (
            <div key={h.factor} className="text-center">
              <div className="relative w-12 h-12 mx-auto mb-1">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="15" fill="none" stroke="hsl(0 0% 100% / 0.06)" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15" fill="none"
                    stroke={h.score > 80 ? "hsl(var(--trust-safe))" : h.score > 60 ? "hsl(var(--sita-gold))" : "hsl(var(--destructive))"}
                    strokeWidth="3" strokeDasharray={`${h.score * 0.942} 100`} strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-foreground/60">{Math.round(h.score)}</span>
              </div>
              <p className="text-[9px] text-foreground/30">{h.factor}</p>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-3 gap-5">
        {/* Timeline */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="col-span-2">
          <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-foreground/50 mb-3">Interaction Timeline</h2>
          <div className="space-y-1.5">
            {timeline.length === 0 ? (
              <p className="text-[10px] text-foreground/30 px-1 py-2">No interactions logged for this contact yet.</p>
            ) : timeline.map((t, i) => {
              const Icon = typeIcons[t.type] || Clock;
              return (
                <motion.div key={t.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.18 + i * 0.03 }}
                  className="flex items-center gap-3 rounded-lg bg-[hsl(0_0%_100%/0.02)] p-2.5"
                >
                  <Icon size={12} className="text-foreground/25 shrink-0" />
                  <span className="text-[10px] text-foreground/60 flex-1 truncate">{t.title}</span>
                  <span className="text-[9px] text-foreground/20">{t.date}</span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Linked items */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-4">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-foreground/50 mb-2">Linked Deals</h2>
            <div className="space-y-1.5">
              {linkedDeals.length === 0 ? (
                <p className="text-[10px] text-foreground/30 px-1 py-2">No deals linked to this contact.</p>
              ) : linkedDeals.map((d) => (
                <div key={d.id} className="rounded-lg border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-2.5">
                  <p className="text-[10px] font-medium text-foreground/70 truncate">{d.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-bold text-[hsl(var(--trust-safe))]">{d.valueLabel}</span>
                    <span className="text-[9px] text-foreground/25">{d.stage}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
