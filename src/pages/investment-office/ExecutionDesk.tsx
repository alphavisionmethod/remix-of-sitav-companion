import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Target, Shield, DollarSign, AlertTriangle, Check, ChevronRight, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import type { TradeAction, Instrument } from "@/lib/investment-office/types";
import { INSTRUMENTS, INVESTMENT_ADVISORS, PLATFORM_CONNECTIONS, SAMPLE_ORDERS } from "@/hooks/useInvestmentOfficeData";
import { useTradeOrders } from "@/hooks/use-investment-office";
import { useDataMode } from "@/contexts/DataModeContext";

export default function ExecutionDesk() {
  const { isDemoMode } = useDataMode();
  const { data: liveData, isLoading } = useTradeOrders();
  const navigate = useNavigate();
  const [selectedInstrument, setSelectedInstrument] = useState<Instrument | null>(INSTRUMENTS[2]);
  const [action, setAction] = useState<TradeAction>("buy");
  const [quantity, setQuantity] = useState("50");
  const [orderType, setOrderType] = useState<"market" | "limit">("limit");
  const [limitPrice, setLimitPrice] = useState("130.00");
  const [status, setStatus] = useState<"config" | "review" | "executing" | "done">("config");

  const execAdvisor = INVESTMENT_ADVISORS.find(a => a.domain === "execution");
  const riskAdvisor = INVESTMENT_ADVISORS.find(a => a.domain === "risk");
  const estCost = selectedInstrument ? (orderType === "limit" ? parseFloat(limitPrice) : selectedInstrument.price) * parseInt(quantity || "0") : 0;

  const handleExecute = () => {
    setStatus("executing");
    setTimeout(() => setStatus("done"), 2500);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <DemoModeBadge />
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Target className="h-6 w-6 text-primary" /> Execution Desk</h1>
        <p className="text-sm text-muted-foreground mt-1">Prepare, review, and execute trades</p>
      </div>

      {/* Execution Advisor */}
      {execAdvisor && (
        <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4 flex items-start gap-3">
          <span className="text-xl">{execAdvisor.icon}</span>
          <div className="flex-1">
            <p className="text-[10px] font-semibold text-primary uppercase tracking-wider">{execAdvisor.title}</p>
            <p className="text-sm text-foreground mt-1">{execAdvisor.currentInsight}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trade Config */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
          <h3 className="text-sm font-semibold text-foreground">Configure Trade</h3>

          {/* Instrument Selector */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Instrument</label>
            <select value={selectedInstrument?.id || ""} onChange={e => setSelectedInstrument(INSTRUMENTS.find(i => i.id === e.target.value) || null)}
              className="w-full rounded-xl border border-border bg-secondary px-3 py-2.5 text-sm text-foreground focus:border-primary/30 focus:outline-none">
              {INSTRUMENTS.map(i => <option key={i.id} value={i.id}>{i.symbol} — {i.name} (${i.price})</option>)}
            </select>
          </div>

          {/* Action */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Action</label>
            <div className="flex gap-2">
              {(["buy", "sell"] as TradeAction[]).map(a => (
                <button key={a} onClick={() => setAction(a)}
                  className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition-colors capitalize ${
                    action === a
                      ? a === "buy" ? "bg-[hsl(var(--trust-safe))] text-white" : "bg-destructive text-white"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}>{a}</button>
              ))}
            </div>
          </div>

          {/* Quantity & Order Type */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Quantity</label>
              <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)}
                className="w-full rounded-xl border border-border bg-secondary px-3 py-2.5 text-sm text-foreground focus:border-primary/30 focus:outline-none" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Order Type</label>
              <select value={orderType} onChange={e => setOrderType(e.target.value as unknown)}
                className="w-full rounded-xl border border-border bg-secondary px-3 py-2.5 text-sm text-foreground focus:border-primary/30 focus:outline-none">
                <option value="market">Market</option>
                <option value="limit">Limit</option>
              </select>
            </div>
          </div>

          {orderType === "limit" && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Limit Price</label>
              <input type="number" step="0.01" value={limitPrice} onChange={e => setLimitPrice(e.target.value)}
                className="w-full rounded-xl border border-border bg-secondary px-3 py-2.5 text-sm text-foreground focus:border-primary/30 focus:outline-none" />
            </div>
          )}

          {/* Platform */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Platform</label>
            <select className="w-full rounded-xl border border-border bg-secondary px-3 py-2.5 text-sm text-foreground focus:border-primary/30 focus:outline-none">
              {PLATFORM_CONNECTIONS.filter(p => p.status === "connected").map(p => (
                <option key={p.id} value={p.id}>{p.icon} {p.name}</option>
              ))}
            </select>
          </div>

          <button onClick={() => setStatus("review")}
            className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
            Review Trade <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Review / Execute Panel */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
          {status === "config" && (
            <div className="text-center py-12 text-muted-foreground">
              <Target className="h-8 w-8 mx-auto mb-3 opacity-40" />
              <p className="text-sm">Configure your trade and click Review</p>
            </div>
          )}

          {status === "review" && selectedInstrument && (
            <>
              <h3 className="text-sm font-semibold text-foreground">Trade Review</h3>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-border">
                <span className="text-2xl">{selectedInstrument.logoIcon}</span>
                <div>
                  <p className="text-sm font-semibold text-foreground capitalize">{action} {selectedInstrument.symbol}</p>
                  <p className="text-[11px] text-muted-foreground">{quantity} units · {orderType}{orderType === "limit" ? ` @ $${limitPrice}` : ""}</p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-muted-foreground">Estimated Cost</span><span className="font-medium text-foreground">${estCost.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Est. Fees</span><span className="text-foreground">~$1.50</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Portfolio Impact</span><span className="text-foreground">+{((estCost / 500000) * 100).toFixed(1)}% weight</span></div>
              </div>

              {/* Risk Preview */}
              {riskAdvisor && (
                <div className="rounded-xl border border-[hsl(var(--trust-warn))]/20 bg-[hsl(var(--trust-warn))]/5 p-3 flex items-start gap-2.5">
                  <Shield className="h-4 w-4 text-[hsl(var(--trust-warn))] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-semibold text-[hsl(var(--trust-warn))] uppercase tracking-wider">Risk Preview</p>
                    <p className="text-[11px] text-foreground mt-0.5">{riskAdvisor.currentInsight}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button onClick={() => setStatus("config")}
                  className="flex-1 rounded-xl bg-secondary py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Edit
                </button>
                <button onClick={handleExecute}
                  className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                  <Check className="h-4 w-4" /> Execute
                </button>
              </div>
            </>
          )}

          {status === "executing" && (
            <div className="text-center py-16">
              <Loader2 className="h-8 w-8 text-primary mx-auto animate-spin mb-4" />
              <p className="text-sm font-medium text-foreground">Executing trade…</p>
              <p className="text-xs text-muted-foreground mt-1">Routing to platform</p>
            </div>
          )}

          {status === "done" && selectedInstrument && (
            <div className="text-center py-12 space-y-4">
              <CheckCircle2 className="h-12 w-12 text-[hsl(var(--trust-safe))] mx-auto" />
              <div>
                <p className="text-lg font-bold text-foreground">Trade Executed</p>
                <p className="text-sm text-muted-foreground capitalize">{action} {quantity} {selectedInstrument.symbol}</p>
              </div>
              <div className="rounded-xl border border-border bg-secondary/20 p-4 text-xs space-y-1.5 text-left">
                <div className="flex justify-between"><span className="text-muted-foreground">Order ID</span><span className="font-mono text-foreground">ORD-{Date.now().toString(36).toUpperCase()}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span className="text-[hsl(var(--trust-safe))] font-medium">Filled</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Execution Receipt</span><span className="text-primary cursor-pointer hover:underline">View Receipt</span></div>
              </div>
              <div className="flex gap-2 justify-center">
                <button onClick={() => { setStatus("config"); }} className="rounded-xl bg-secondary px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">New Trade</button>
                <button onClick={() => navigate("/investments/portfolio")} className="rounded-xl bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors">View Portfolio</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pending Orders */}
      {SAMPLE_ORDERS.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Prepared Orders</h3>
          {SAMPLE_ORDERS.map(ord => (
            <div key={ord.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/20 border border-border">
              <span className="text-lg">{ord.instrument.logoIcon}</span>
              <div className="flex-1">
                <p className="text-xs font-medium text-foreground capitalize">{ord.action} {ord.quantity} {ord.instrument.symbol}</p>
                <p className="text-[10px] text-muted-foreground">{ord.orderType}{ord.limitPrice ? ` @ $${ord.limitPrice}` : ""} · {ord.platform}</p>
              </div>
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-medium text-primary capitalize">{ord.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
