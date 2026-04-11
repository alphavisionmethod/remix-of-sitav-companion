import { AppWelcomeHeader } from "@/components/sita/AppWelcomeHeader";
import { InAppAdvisorStrip } from "@/components/sita/InAppAdvisorStrip";
import { motion } from "framer-motion";
import { FileSignature, Clock, CheckCircle, AlertCircle, Plus, Eye, Send } from "lucide-react";
import { cn } from "@/lib/utils";

const proposals = [
  { id: "P-001", title: "Website Redesign — Bloom Studio", client: "Sarah Chen", amount: "$12,000", status: "sent", sentDate: "Mar 28", expiresIn: "3 days", views: 5 },
  { id: "P-002", title: "SEO Audit — RiverTech", client: "Marcus Rivera", amount: "$3,500", status: "draft", sentDate: "—", expiresIn: "—", views: 0 },
  { id: "P-003", title: "Brand Package — Park & Associates", client: "Emily Park", amount: "$24,000", status: "signed", sentDate: "Mar 15", expiresIn: "—", views: 12 },
  { id: "P-004", title: "Monthly Retainer — Morton Labs", client: "James Morton", amount: "$6,000/mo", status: "expired", sentDate: "Feb 20", expiresIn: "Expired", views: 2 },
];

const statusConfig: Record<string, { icon: typeof CheckCircle; color: string; bg: string }> = {
  draft: { icon: Clock, color: "text-muted-foreground", bg: "bg-muted" },
  sent: { icon: Send, color: "text-blue-500", bg: "bg-blue-500/15" },
  signed: { icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-500/15" },
  expired: { icon: AlertCircle, color: "text-destructive", bg: "bg-destructive/15" },
};

const ProposalsContracts = () => (
  <div className="mx-auto max-w-5xl space-y-6">
    <AppWelcomeHeader domain="business" />
    <InAppAdvisorStrip domain="business" />

    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-xl font-bold">Proposals & Contracts</h1>
        <p className="text-sm text-muted-foreground">Track proposals, collect e-signatures, manage contract lifecycle</p>
      </div>
      <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors">
        <Plus className="h-4 w-4" /> New Proposal
      </button>
    </div>

    {/* Stats */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {[
        { label: "Active Proposals", value: "4", sub: "2 awaiting signature" },
        { label: "Win Rate", value: "68%", sub: "↑ 5% this month" },
        { label: "Avg. Time to Sign", value: "3.2 days", sub: "Improving" },
        { label: "Pipeline Value", value: "$45.5K", sub: "Active proposals" },
      ].map(s => (
        <div key={s.label} className="rounded-xl border border-border/40 bg-card/50 p-4">
          <p className="text-lg font-bold">{s.value}</p>
          <p className="text-[11px] text-muted-foreground">{s.label}</p>
          <p className="text-[10px] text-primary/60 mt-0.5">{s.sub}</p>
        </div>
      ))}
    </div>

    {/* Proposals list */}
    <div className="space-y-2">
      {proposals.map((p, i) => {
        const sc = statusConfig[p.status];
        const Icon = sc.icon;
        return (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-4 rounded-xl border border-border/40 bg-card/50 p-4 hover:border-primary/30 transition-colors cursor-pointer"
          >
            <FileSignature className="h-5 w-5 text-primary/60 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{p.title}</p>
              <p className="text-[11px] text-muted-foreground">{p.client} · {p.amount}</p>
            </div>
            <div className="text-right shrink-0">
              <span className={cn("inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full capitalize", sc.bg, sc.color)}>
                <Icon className="h-3 w-3" /> {p.status}
              </span>
              <p className="text-[10px] text-muted-foreground mt-0.5">{p.views} views</p>
            </div>
            <button className="p-1.5 rounded-lg hover:bg-muted shrink-0"><Eye className="h-3.5 w-3.5" /></button>
          </motion.div>
        );
      })}
    </div>
  </div>
);

export default ProposalsContracts;
