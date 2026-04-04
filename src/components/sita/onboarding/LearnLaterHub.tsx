import { motion } from "framer-motion";
import { Brain, Shield, Database, BarChart3, FileText, Sliders, Globe, BookOpen, Plug, Clock } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface DeferredItem {
  key: string;
  label: string;
}

interface LearnLaterHubProps {
  deferredConnections?: string[];
  skippedPhases?: string[];
}

const topics = [
  { icon: Brain, title: "How SITA thinks", desc: "Advisor reasoning, confidence, and recommendation flow." },
  { icon: Shield, title: "How approvals work", desc: "Trust levels, gating, and the approval chain." },
  { icon: Database, title: "How memory works", desc: "What SITA remembers, forgets, and how to correct it." },
  { icon: BarChart3, title: "How Boardroom works", desc: "Weekly reviews, decision packets, and operating rhythm." },
  { icon: FileText, title: "How proofs work", desc: "Receipts, audit trails, and verification." },
  { icon: Sliders, title: "How to change autonomy", desc: "Adjusting trust levels and delegation boundaries." },
  { icon: Globe, title: "How to connect more systems", desc: "Adding integrations, APIs, and data sources." },
];

export function LearnLaterHub({ deferredConnections = [], skippedPhases = [] }: LearnLaterHubProps) {
  const reduced = useReducedMotion();
  const hasDeferredItems = deferredConnections.length > 0 || skippedPhases.length > 0;

  return (
    <motion.div
      initial={reduced ? {} : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border bg-card overflow-hidden"
    >
      {/* Deferred completion center */}
      {hasDeferredItems && (
        <div className="p-5 border-b border-border bg-[hsl(var(--sita-gold))]/5">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-[hsl(var(--sita-gold))]" />
            <h3 className="text-sm font-bold text-foreground">Finish later</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Items you deferred during setup</p>
          <div className="mt-3 space-y-1.5">
            {deferredConnections.map(c => (
              <button key={c} className="w-full flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-secondary/30 transition-colors text-left">
                <Plug className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="text-xs text-foreground">Connect {c}</span>
                <span className="ml-auto text-[10px] text-muted-foreground">Set up →</span>
              </button>
            ))}
            {skippedPhases.map(p => (
              <button key={p} className="w-full flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-secondary/30 transition-colors text-left">
                <Sliders className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="text-xs text-foreground">{p.replace(/-/g, " ")}</span>
                <span className="ml-auto text-[10px] text-muted-foreground">Configure →</span>
              </button>
            ))}
          </div>
        </div>
      )}

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
