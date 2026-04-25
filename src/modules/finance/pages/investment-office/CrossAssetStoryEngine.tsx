import { motion } from "framer-motion";
import { Network, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMarketWatchlistItems } from "@/hooks/use-investment-office";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
export default function CrossAssetStoryEngine() {
  const { data: liveData, isLoading } = useMarketWatchlistItems();
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-6xl space-y-6">
<div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Network className="h-6 w-6 text-primary" /> Cross-Asset Story Engine</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Map narratives across markets — see what connects stocks, crypto, commodities, and events</p>
      </div>

      {([] as any[]).map((n, ni) => (
        <motion.div key={n.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: ni * 0.06 }}
          className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{n.icon}</span>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-foreground">{n.title}</h2>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase">Narrative Strength</p>
                <div className="h-1.5 w-24 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${n.strength}%` }} />
                </div>
                <span className="text-[10px] font-bold text-foreground">{n.strength}%</span>
              </div>
            </div>
          </div>

          {/* Connected Assets */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {n.connections.map(c => (
              <div key={c.asset} className="rounded-xl border border-border bg-secondary/20 p-3 flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground">{c.asset}</span>
                    <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[8px] text-muted-foreground">{c.class}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{c.role}</p>
                </div>
                <ChevronRight className="h-3 w-3 text-muted-foreground" />
              </div>
            ))}
          </div>

          {/* Drivers & Risks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="rounded-xl bg-[hsl(var(--trust-safe))]/5 border border-[hsl(var(--trust-safe))]/15 p-3 space-y-1">
              <p className="text-[9px] font-semibold text-[hsl(var(--trust-safe))] uppercase">Macro Drivers</p>
              {n.macroDrivers.map((d, i) => (
                <p key={i} className="text-[10px] text-foreground">• {d}</p>
              ))}
            </div>
            <div className="rounded-xl bg-destructive/5 border border-destructive/15 p-3 space-y-1">
              <p className="text-[9px] font-semibold text-destructive uppercase">Key Risks</p>
              {n.risks.map((r, i) => (
                <p key={i} className="text-[10px] text-foreground">• {r}</p>
              ))}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
