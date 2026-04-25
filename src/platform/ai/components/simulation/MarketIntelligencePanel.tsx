// ═══════════════════════════════════════════════════════════════
// SITA OS — Market Intelligence Panel
// Real-time data, grounding badges, news sentiment
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Globe, TrendingUp, TrendingDown, Minus, CheckCircle2, AlertCircle,
  Loader2, RefreshCw, Newspaper, Shield,
} from "lucide-react";
import { DataFreshnessBadge } from "@/platform/sita/components/sita/DataFreshnessBadge";
import type { IntelligenceReport, MarketDataPoint } from "@/domains/simulation/market-intelligence";

interface MarketIntelligencePanelProps {
  intelligence: IntelligenceReport | null;
  isLoading: boolean;
  groundedVarIds: Set<string>;
  onFetchIntelligence: () => void;
}

const SENTIMENT_CONFIG = {
  bullish: { icon: TrendingUp, color: "text-[hsl(var(--trust-safe))]", label: "Bullish" },
  bearish: { icon: TrendingDown, color: "text-[hsl(var(--destructive))]", label: "Bearish" },
  neutral: { icon: Minus, color: "text-muted-foreground", label: "Neutral" },
  mixed: { icon: RefreshCw, color: "text-[hsl(var(--sita-gold))]", label: "Mixed" },
};

const CONFIDENCE_ICONS = {
  high: { icon: CheckCircle2, color: "text-[hsl(var(--trust-safe))]" },
  medium: { icon: AlertCircle, color: "text-[hsl(var(--sita-gold))]" },
  low: { icon: AlertCircle, color: "text-muted-foreground" },
};

export function MarketIntelligencePanel({
  intelligence,
  isLoading,
  groundedVarIds,
  onFetchIntelligence,
}: MarketIntelligencePanelProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="flex flex-col h-full p-4 space-y-4 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-primary" />
          <span className="text-xs font-bold text-foreground">Market Intelligence</span>
        </div>
        {intelligence && (
          <DataFreshnessBadge
            lastFetchedAt={intelligence.fetchedAt ? new Date(intelligence.fetchedAt) : null}
            onRefresh={onFetchIntelligence}
          />
        )}
      </div>

      {/* Ground My Assumptions */}
      <Button
        onClick={onFetchIntelligence}
        disabled={isLoading}
        variant="outline"
        size="sm"
        className="w-full gap-2 border-primary/20 text-primary hover:bg-primary/5"
      >
        {isLoading ? (
          <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Fetching Data...</>
        ) : (
          <><Globe className="h-3.5 w-3.5" /> Ground My Assumptions</>
        )}
      </Button>

      {!intelligence && !isLoading && (
        <div className="flex flex-col items-center justify-center flex-1 text-center py-8">
          <Shield className="h-8 w-8 text-muted-foreground/20 mb-2" />
          <p className="text-[11px] text-muted-foreground">
            Click above to fetch real-world data and ground your simulation variables
          </p>
        </div>
      )}

      <AnimatePresence>
        {intelligence && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Sentiment */}
            <div className="rounded-xl border border-border/40 bg-card/30 p-3">
              <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Market Sentiment
              </div>
              {(() => {
                const cfg = SENTIMENT_CONFIG[intelligence.sentiment];
                const Icon = cfg.icon;
                return (
                  <div className="flex items-center gap-2">
                    <Icon className={cn("h-5 w-5", cfg.color)} />
                    <div>
                      <div className={cn("text-sm font-bold", cfg.color)}>{cfg.label}</div>
                      <div className="text-[9px] text-muted-foreground">
                        Score: {(intelligence.sentimentScore * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Grounding Status */}
            <div>
              <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Grounding Status ({groundedVarIds.size} grounded)
              </div>
              <div className="flex items-center gap-2 mb-1">
                <div className="flex-1 h-1.5 rounded-full bg-secondary/40 overflow-hidden">
                  <div
                    className="h-full bg-[hsl(var(--trust-safe))] rounded-full transition-all"
                    style={{ width: `${intelligence.dataPoints.length > 0 ? (groundedVarIds.size / intelligence.dataPoints.length * 100) : 0}%` }}
                  />
                </div>
                <span className="text-[9px] text-muted-foreground">
                  {intelligence.isGrounded ? "Grounded" : "Ungrounded"}
                </span>
              </div>
            </div>

            {/* Data Points */}
            {intelligence.dataPoints.length > 0 && (
              <div>
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 block hover:text-foreground"
                >
                  Data Points ({intelligence.dataPoints.length}) {expanded ? "▾" : "▸"}
                </button>
                {expanded && (
                  <div className="space-y-1.5">
                    {intelligence.dataPoints.map((dp, i) => {
                      const conf = CONFIDENCE_ICONS[dp.confidence];
                      const ConfIcon = conf.icon;
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: 6 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex items-center gap-2 rounded-lg border border-border/30 bg-card/20 px-3 py-2"
                        >
                          <ConfIcon className={cn("h-3 w-3 shrink-0", conf.color)} />
                          <div className="flex-1 min-w-0">
                            <div className="text-[10px] font-medium text-foreground truncate">
                              {dp.variable}
                            </div>
                            <div className="text-[9px] text-muted-foreground">{dp.source}</div>
                          </div>
                          <span className="text-[11px] font-mono font-bold text-foreground">
                            {dp.currentValue.toLocaleString()}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Headlines */}
            {intelligence.headlines.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Newspaper className="h-3 w-3 text-muted-foreground" />
                  <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Relevant Headlines
                  </span>
                </div>
                <div className="space-y-1">
                  {intelligence.headlines.map((h, i) => (
                    <div key={i} className="text-[10px] text-muted-foreground pl-2 border-l-2 border-border/30 py-0.5">
                      {h}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
