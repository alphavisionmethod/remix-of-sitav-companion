import { motion } from "framer-motion";
import { Network, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

const NARRATIVES = [
  {
    id: "n1", title: "AI Infrastructure Supercycle", icon: "🤖", strength: 90,
    connections: [
      { asset: "NVDA", class: "Equity", role: "GPU monopoly — direct beneficiary" },
      { asset: "MSFT", class: "Equity", role: "Azure AI / Copilot — infrastructure + monetization" },
      { asset: "BTC", class: "Crypto", role: "Risk-on correlation — AI narrative lifts crypto sentiment" },
      { asset: "SPY", class: "ETF", role: "Tech-heavy index benefits from AI leadership" },
    ],
    macroDrivers: ["Fed easing supports growth multiples", "Corporate AI capex accelerating", "Productivity gains visible in earnings"],
    risks: ["Capex cycle peaking", "Regulation of AI models", "Export controls on chips"],
  },
  {
    id: "n2", title: "Monetary Easing Cycle", icon: "🏦", strength: 65,
    connections: [
      { asset: "XAUUSD", class: "Commodity", role: "Lower real rates support gold" },
      { asset: "BTC", class: "Crypto", role: "Liquidity expansion historically bullish for BTC" },
      { asset: "SPY", class: "ETF", role: "Rate cuts support risk assets broadly" },
      { asset: "FED-CUT-JUN", class: "Event", role: "Direct probability trade on rate decision" },
    ],
    macroDrivers: ["Inflation declining toward target", "Labor market cooling", "Global central banks coordinating"],
    risks: ["Inflation re-acceleration", "Fiscal spending overwhelms rate cuts", "Fed credibility questioned"],
  },
  {
    id: "n3", title: "Crypto Structural Adoption", icon: "⛓️", strength: 72,
    connections: [
      { asset: "BTC", class: "Crypto", role: "ETF inflows creating structural demand floor" },
      { asset: "ETH", class: "Crypto", role: "Smart contract platform for institutional DeFi" },
      { asset: "SOL", class: "Crypto", role: "High-performance chain for consumer DeFi" },
    ],
    macroDrivers: ["ETF approval legitimized asset class", "Institutional allocation growing", "Halving supply dynamics"],
    risks: ["Regulatory crackdown", "Exchange failures", "Liquidity fragmentation"],
  },
  {
    id: "n4", title: "Geopolitical Risk Premium", icon: "🌍", strength: 48,
    connections: [
      { asset: "XAUUSD", class: "Commodity", role: "Traditional safe haven" },
      { asset: "CL", class: "Commodity", role: "Supply disruption risk in energy" },
      { asset: "SPY", class: "ETF", role: "Risk-off pressure on equities" },
    ],
    macroDrivers: ["Middle East tensions", "US-China competition", "Trade policy uncertainty"],
    risks: ["De-escalation reduces premium", "Markets price in conflict fatigue"],
  },
];

export default function CrossAssetStoryEngine() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <DemoModeBadge />
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Network className="h-6 w-6 text-primary" /> Cross-Asset Story Engine</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Map narratives across markets — see what connects stocks, crypto, commodities, and events</p>
      </div>

      {NARRATIVES.map((n, ni) => (
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
