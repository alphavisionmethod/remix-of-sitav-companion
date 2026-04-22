import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Target, Shield, DollarSign, AlertTriangle, Check, ChevronRight, ArrowRight, Loader2, CheckCircle2, Brain, FileText, Clock } from "lucide-react";
import type { TradeAction, Instrument } from "@/domains/investment/types";
import { INSTRUMENTS, INVESTMENT_ADVISORS, PLATFORM_CONNECTIONS, SAMPLE_ORDERS, SAMPLE_THESES } from "@/hooks/useInvestmentOfficeData";
import { useTradeOrders } from "@/hooks/use-investment-office";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";

// ── Trade Prep Receipt ──
function TradePrepReceipt({ instrument, action, quantity, orderType, limitPrice, estCost }: {
  instrument: Instrument; action: TradeAction; quantity: string; orderType: string; limitPrice: string; estCost: number;
}) {
  const execAdvisor = INVESTMENT_ADVISORS.find(a => a.domain === "execution");
  const riskAdvisor = INVESTMENT_ADVISORS.find(a => a.domain === "risk");
  const behavAdvisor = INVESTMENT_ADVISORS.find(a => a.domain === "behavioral");
  const thesis = SAMPLE_THESES.find(t => t.instrumentId === instrument.id && t.status === "active");

  return (
    <div className="rounded-2xl border-2 border-primary/20 bg-gradient-to-b from-primary/5 via-card to-card p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <FileText className="h-5 w-5 text-primary" />
        <div className="flex-1">
          <p className="text-xs font-bold text-primary uppercase tracking-wider">Trade Prep Receipt</p>
          <p className="text-[10px] text-muted-foreground">Generated {new Date().toLocaleDateString()} · Pre-execution review</p>
        </div>
        <span className="rounded-full bg-[hsl(var(--trust-warn))]/10 px-3 py-1 text-[10px] font-bold text-[hsl(var(--trust-warn))] uppercase">Awaiting Approval</span>
      </div>

      {/* Trade Details */}
      <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30 border border-border">
        <span className="text-3xl">{instrument.logoIcon}</span>
        <div className="flex-1">
          <p className="text-lg font-bold text-foreground capitalize">{action} {instrument.symbol}</p>
          <p className="text-xs text-muted-foreground">{instrument.name} · {instrument.assetClass}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-foreground">${estCost.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground">{quantity} × ${orderType === "limit" ? limitPrice : instrument.price.toLocaleString()}</p>
        </div>
      </div>

      {/* Intent & Rationale */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-3 space-y-1">
          <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Intent</p>
          <p className="text-xs text-foreground">{action === "buy" ? "Increase position / new entry" : "Reduce exposure / take profit"}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 space-y-1">
          <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Linked Thesis</p>
          <p className="text-xs text-foreground">{thesis ? thesis.title : "No thesis linked"}</p>
        </div>
      </div>

      {/* Advisor Views */}
      <div className="space-y-2">
        <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Advisor Council Views</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {[execAdvisor, riskAdvisor, behavAdvisor].filter(Boolean).map(adv => adv && (
            <div key={adv.id} className="rounded-xl border border-border bg-secondary/20 p-3 space-y-1.5">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">{adv.icon}</span>
                <span className="text-[10px] font-bold text-foreground">{adv.name}</span>
                <span className={`ml-auto rounded-full px-1.5 py-0.5 text-[8px] font-bold ${
                  adv.confidenceLevel === "high" ? "bg-[hsl(var(--trust-safe))]/10 text-trust-safe animate-pulse-safe" :
                  adv.confidenceLevel === "moderate" ? "bg-[hsl(var(--trust-warn))]/10 text-[hsl(var(--trust-warn))] animate-pulse-warn" :
                  "bg-destructive/10 text-destructive animate-pulse-danger"
                }`}>{adv.confidence}%</span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-2">{adv.currentInsight}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Assessment */}
      <div className="rounded-xl border border-[hsl(var(--trust-warn))]/20 bg-[hsl(var(--trust-warn))]/5 p-4 space-y-2">
        <p className="text-[9px] font-semibold text-[hsl(var(--trust-warn))] uppercase tracking-wider flex items-center gap-1">
          <Shield className="h-3 w-3" /> Risk Assessment
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Est. Portfolio Impact</span><span className="font-medium text-foreground">+{((estCost / 500000) * 100).toFixed(1)}% weight</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Est. Fees</span><span className="text-foreground">~$1.50</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Approval Required</span><span className="text-foreground">No</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Slippage Risk</span><span className="text-foreground">{orderType === "limit" ? "None (limit)" : "Low"}</span></div>
        </div>
      </div>

      {/* Conviction & Risk Bar */}
      <div className="flex gap-4">
        <div className="flex-1">
          <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Thesis Conviction</p>
          <div className="h-2 rounded-full bg-secondary overflow-hidden">
            <div className="h-full rounded-full bg-primary/70" style={{ width: thesis ? (thesis.conviction === "high" ? "85%" : thesis.conviction === "medium" ? "55%" : "30%") : "20%" }} />
          </div>
        </div>
        <div className="flex-1">
          <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Risk Contribution</p>
          <div className="h-2 rounded-full bg-secondary overflow-hidden">
            <div className="h-full rounded-full bg-[hsl(var(--trust-warn))]" style={{ width: `${Math.min(estCost / 5000, 100)}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ExecutionDesk() {
  const { data: liveData, isLoading } = useTradeOrders();
  const navigate = useNavigate();
  const [selectedInstrument, setSelectedInstrument] = useState<Instrument | null>(INSTRUMENTS[2]);
  const [action, setAction] = useState<TradeAction>("buy");
  const [quantity, setQuantity] = useState("50");
  const [orderType, setOrderType] = useState<"market" | "limit">("limit");
  const [limitPrice, setLimitPrice] = useState("130.00");
  const [status, setStatus] = useState<"config" | "review" | "executing" | "done">("config");

  const estCost = selectedInstrument ? (orderType === "limit" ? parseFloat(limitPrice) : selectedInstrument.price) * parseInt(quantity || "0") : 0;

  const handleExecute = () => {
    setStatus("executing");
    setTimeout(() => setStatus("done"), 2500);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
<div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Target className="h-6 w-6 text-primary" /> Execution Desk</h1>
        <p className="text-sm text-muted-foreground mt-1">Prepare, review, and execute trades</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trade Config */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
          <h3 className="text-sm font-semibold text-foreground">Configure Trade</h3>

          <div className="space-y-1.5">
            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Instrument</label>
            <select value={selectedInstrument?.id || ""} onChange={e => setSelectedInstrument(INSTRUMENTS.find(i => i.id === e.target.value) || null)}
              className="w-full rounded-xl border border-border bg-secondary px-3 py-2.5 text-sm text-foreground focus:border-primary/30 focus:outline-none">
              {INSTRUMENTS.map(i => <option key={i.id} value={i.id}>{i.symbol} — {i.name} (${i.price})</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Action</label>
            <div className="flex gap-2">
              {(["buy", "sell"] as TradeAction[]).map(a => (
                <button key={a} onClick={() => setAction(a)}
                  className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition-colors capitalize ${
                    action === a
                      ? a === "buy" ? "bg-trust-safe text-foreground" : "bg-destructive text-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}>{a}</button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Quantity</label>
              <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)}
                className="w-full rounded-xl border border-border bg-secondary px-3 py-2.5 text-sm text-foreground focus:border-primary/30 focus:outline-none" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Order Type</label>
              <select value={orderType} onChange={e => setOrderType(e.target.value as never)}
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
        <div className="space-y-4">
          {status === "config" && (
            <div className="rounded-2xl border border-border bg-card p-6 text-center py-12 text-muted-foreground">
              <Target className="h-8 w-8 mx-auto mb-3 opacity-40" />
              <p className="text-sm">Configure your trade and click Review</p>
            </div>
          )}

          {status === "review" && selectedInstrument && (
            <>
              <TradePrepReceipt
                instrument={selectedInstrument}
                action={action}
                quantity={quantity}
                orderType={orderType}
                limitPrice={limitPrice}
                estCost={estCost}
              />
              <div className="flex gap-2">
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
            <div className="rounded-2xl border border-border bg-card p-6 text-center py-16">
              <Loader2 className="h-8 w-8 text-primary mx-auto animate-spin mb-4" />
              <p className="text-sm font-medium text-foreground">Executing trade…</p>
              <p className="text-xs text-muted-foreground mt-1">Routing to platform</p>
            </div>
          )}

          {status === "done" && selectedInstrument && (
            <div className="rounded-2xl border border-border bg-card p-6 text-center py-12 space-y-4">
              <CheckCircle2 className="h-12 w-12 text-trust-safe mx-auto" />
              <div>
                <p className="text-lg font-bold text-foreground">Trade Executed</p>
                <p className="text-sm text-muted-foreground capitalize">{action} {quantity} {selectedInstrument.symbol}</p>
              </div>
              <div className="rounded-xl border border-border bg-secondary/20 p-4 text-xs space-y-1.5 text-left">
                <div className="flex justify-between"><span className="text-muted-foreground">Order ID</span><span className="font-mono text-foreground">ORD-{Date.now().toString(36).toUpperCase()}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span className="text-trust-safe font-medium">Filled</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Execution Receipt</span><span className="text-primary cursor-pointer hover:underline">View Receipt</span></div>
              </div>
              <div className="flex gap-2 justify-center">
                <button onClick={() => setStatus("config")} className="rounded-xl bg-secondary px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">New Trade</button>
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
