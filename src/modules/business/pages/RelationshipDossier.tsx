import { useState } from "react";
import { motion } from "framer-motion";
import {
  User, Heart, Clock, Mail, Phone, FileText, TrendingUp,
  Star, AlertTriangle, CheckCircle, Calendar, DollarSign,
  ArrowUpRight, Shield, Building2
} from "lucide-react";
import { cn } from "@/lib/utils";

const DOSSIER_CONTACT = {
  name: "Sarah Chen",
  title: "VP of Engineering",
  company: "NovaTech Corp",
  email: "sarah.chen@novatech.com",
  phone: "+1 (555) 234-5678",
  health: 88,
  lifetime: "$245,000",
  openDeals: 2,
  since: "March 2023",
  lastContact: "2 days ago",
  nextFollowUp: "Tomorrow, 10:00 AM",
  tags: ["Decision Maker", "Champion", "Technical"],
};

const HEALTH_BREAKDOWN = [
  { factor: "Engagement", score: 92 },
  { factor: "Response time", score: 85 },
  { factor: "Meeting frequency", score: 78 },
  { factor: "Deal momentum", score: 90 },
  { factor: "Sentiment", score: 95 },
];

const TIMELINE = [
  { date: "Apr 10", type: "call", title: "Strategy alignment call — 35 min", outcome: "positive" },
  { date: "Apr 7", type: "email", title: "Sent product roadmap update", outcome: "positive" },
  { date: "Apr 3", type: "meeting", title: "Quarterly business review", outcome: "positive" },
  { date: "Mar 28", type: "deal", title: "Expanded to Enterprise tier — $85K", outcome: "positive" },
  { date: "Mar 15", type: "support", title: "Resolved API integration issue", outcome: "neutral" },
  { date: "Mar 8", type: "email", title: "Follow-up on implementation plan", outcome: "positive" },
];

const LINKED_DEALS = [
  { name: "Enterprise License Expansion", value: "$85,000", stage: "Negotiation", probability: 75 },
  { name: "API Integration Add-on", value: "$12,000", stage: "Closed Won", probability: 100 },
];

const LINKED_FILES = [
  { name: "Proposal_NovaTech_v3.pdf", type: "proposal", date: "Apr 8" },
  { name: "QBR_Q1_Slides.pptx", type: "presentation", date: "Apr 3" },
  { name: "Contract_Amendment.docx", type: "contract", date: "Mar 28" },
];

const typeIcons: Record<string, React.ElementType> = {
  call: Phone, email: Mail, meeting: Calendar, deal: DollarSign, support: Shield,
};

export default function RelationshipDossier() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 overflow-y-auto">
      {/* Hero card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
        className="rounded-2xl border border-[hsl(265_55%_58%/0.15)] bg-gradient-to-br from-[hsl(265_55%_58%/0.06)] to-[hsl(0_0%_100%/0.01)] p-6"
      >
        <div className="flex items-start gap-5">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[hsl(265_55%_58%)] to-[hsl(280_50%_45%)] flex items-center justify-center text-xl font-bold text-[hsl(0_0%_100%)] shadow-lg"
          >
            SC
          </motion.div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">{DOSSIER_CONTACT.name}</h1>
            <p className="text-xs text-foreground/40">{DOSSIER_CONTACT.title} · {DOSSIER_CONTACT.company}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {DOSSIER_CONTACT.tags.map((tag) => (
                <span key={tag} className="text-[9px] px-2 py-0.5 rounded-full bg-[hsl(var(--sita-purple))]/10 text-[hsl(var(--sita-purple))] font-semibold">{tag}</span>
              ))}
            </div>
          </div>
          <div className="text-right space-y-1">
            <div className="flex items-center gap-1 justify-end">
              <Heart size={14} className={cn(DOSSIER_CONTACT.health > 80 ? "text-[hsl(var(--trust-safe))]" : "text-[hsl(var(--sita-gold))]")} />
              <span className="text-lg font-bold text-foreground/90">{DOSSIER_CONTACT.health}%</span>
            </div>
            <p className="text-[9px] text-foreground/25">Relationship Health</p>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-5 gap-3 mt-5">
          {[
            { label: "Lifetime Value", value: DOSSIER_CONTACT.lifetime },
            { label: "Open Deals", value: `${DOSSIER_CONTACT.openDeals}` },
            { label: "Since", value: DOSSIER_CONTACT.since },
            { label: "Last Contact", value: DOSSIER_CONTACT.lastContact },
            { label: "Next Follow-Up", value: DOSSIER_CONTACT.nextFollowUp },
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
          {HEALTH_BREAKDOWN.map((h) => (
            <div key={h.factor} className="text-center">
              <div className="relative w-12 h-12 mx-auto mb-1">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="15" fill="none" stroke="hsl(0 0% 100% / 0.06)" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15" fill="none"
                    stroke={h.score > 80 ? "hsl(var(--trust-safe))" : h.score > 60 ? "hsl(var(--sita-gold))" : "hsl(var(--destructive))"}
                    strokeWidth="3" strokeDasharray={`${h.score * 0.942} 100`} strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-foreground/60">{h.score}</span>
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
            {TIMELINE.map((t, i) => {
              const Icon = typeIcons[t.type] || Clock;
              return (
                <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.18 + i * 0.03 }}
                  className="flex items-center gap-3 rounded-lg bg-[hsl(0_0%_100%/0.02)] p-2.5"
                >
                  <Icon size={12} className="text-foreground/25 shrink-0" />
                  <span className="text-[10px] text-foreground/60 flex-1">{t.title}</span>
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
              {LINKED_DEALS.map((d) => (
                <div key={d.name} className="rounded-lg border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-2.5">
                  <p className="text-[10px] font-medium text-foreground/70 truncate">{d.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-bold text-[hsl(var(--trust-safe))]">{d.value}</span>
                    <span className="text-[9px] text-foreground/25">{d.stage}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-foreground/50 mb-2">Linked Files</h2>
            <div className="space-y-1.5">
              {LINKED_FILES.map((f) => (
                <div key={f.name} className="flex items-center gap-2 rounded-lg bg-[hsl(0_0%_100%/0.02)] p-2">
                  <FileText size={11} className="text-foreground/25 shrink-0" />
                  <span className="text-[10px] text-foreground/50 flex-1 truncate">{f.name}</span>
                  <span className="text-[9px] text-foreground/20">{f.date}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
