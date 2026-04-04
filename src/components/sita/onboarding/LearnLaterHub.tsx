import { motion } from "framer-motion";
import { Brain, Shield, Database, BarChart3, FileText, Sliders, Globe, BookOpen } from "lucide-react";

const topics = [
  { icon: Brain, title: "How SITA thinks", desc: "Advisor reasoning, confidence, and recommendation flow." },
  { icon: Shield, title: "How approvals work", desc: "Trust levels, gating, and the approval chain." },
  { icon: Database, title: "How memory works", desc: "What SITA remembers, forgets, and how to correct it." },
  { icon: BarChart3, title: "How Boardroom works", desc: "Weekly reviews, decision packets, and operating rhythm." },
  { icon: FileText, title: "How proofs work", desc: "Receipts, audit trails, and verification." },
  { icon: Sliders, title: "How to change autonomy", desc: "Adjusting trust levels and delegation boundaries." },
  { icon: Globe, title: "How to connect more systems", desc: "Adding integrations, APIs, and data sources." },
];

export function LearnLaterHub() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border bg-card overflow-hidden"
    >
      <div className="p-5 border-b border-border">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground">Learn when you're ready</h3>
        </div>
        <p className="text-xs text-muted-foreground mt-1">No rush. Explore these when you're curious.</p>
      </div>
      <div className="divide-y divide-border">
        {topics.map(t => (
          <button key={t.title} className="w-full flex items-center gap-3 px-5 py-3 hover:bg-secondary/30 transition-colors text-left">
            <t.icon className="h-4 w-4 text-primary shrink-0" />
            <div>
              <p className="text-xs font-semibold text-foreground">{t.title}</p>
              <p className="text-[11px] text-muted-foreground">{t.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
