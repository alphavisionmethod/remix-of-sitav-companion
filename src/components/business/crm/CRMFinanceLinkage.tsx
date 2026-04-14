// SITA OS — CRM Finance Linkage Component
// Cross-domain integration: CRM ↔ Finance OS (invoices, collections, revenue)
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  DollarSign, Receipt, AlertTriangle, TrendingUp, TrendingDown,
  Clock, CheckCircle, XCircle, ArrowRight, Banknote, CreditCard,
  BarChart3, Sparkles, Shield, ChevronRight, ExternalLink
} from "lucide-react";
import { format, formatDistanceToNow, isPast, differenceInDays } from "date-fns";

// ── Demo data (until real Finance OS integration is wired) ──

interface Invoice {
  id: string;
  number: string;
  amount: number;
  status: "paid" | "pending" | "overdue" | "partial" | "draft";
  issued_at: string;
  due_at: string;
  paid_at?: string;
  description: string;
}

interface CollectionEntry {
  id: string;
  invoice_id: string;
  amount_owed: number;
  amount_collected: number;
  status: "in_progress" | "escalated" | "resolved" | "written_off";
  last_action_at: string;
  next_action: string;
}

interface RevenueSnapshot {
  total_lifetime: number;
  last_12_months: number;
  last_30_days: number;
  trend: "up" | "down" | "flat";
  trend_pct: number;
  avg_deal_value: number;
  payment_reliability: number; // 0-100
}

function generateDemoInvoices(entityName: string): Invoice[] {
  return [
    { id: "inv-1", number: "INV-2026-0042", amount: 15000, status: "paid", issued_at: "2026-02-15", due_at: "2026-03-15", paid_at: "2026-03-10", description: `Consulting services — ${entityName}` },
    { id: "inv-2", number: "INV-2026-0067", amount: 8500, status: "pending", issued_at: "2026-03-28", due_at: "2026-04-28", description: `Monthly retainer — ${entityName}` },
    { id: "inv-3", number: "INV-2026-0071", amount: 3200, status: "overdue", issued_at: "2026-03-01", due_at: "2026-03-31", description: `Implementation phase 2 — ${entityName}` },
    { id: "inv-4", number: "INV-2025-0189", amount: 22000, status: "paid", issued_at: "2025-11-10", due_at: "2025-12-10", paid_at: "2025-12-08", description: `Annual license — ${entityName}` },
  ];
}

function generateDemoCollections(): CollectionEntry[] {
  return [
    { id: "col-1", invoice_id: "inv-3", amount_owed: 3200, amount_collected: 0, status: "in_progress", last_action_at: "2026-04-10", next_action: "Send final reminder email" },
  ];
}

function generateDemoRevenue(): RevenueSnapshot {
  return { total_lifetime: 48700, last_12_months: 26700, last_30_days: 8500, trend: "up", trend_pct: 12, avg_deal_value: 12175, payment_reliability: 82 };
}

// ── Status rendering ──

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  paid: { label: "Paid", color: "bg-green-500/15 text-green-400 border-green-500/25", icon: <CheckCircle className="h-3 w-3" /> },
  pending: { label: "Pending", color: "bg-yellow-500/15 text-yellow-400 border-yellow-500/25", icon: <Clock className="h-3 w-3" /> },
  overdue: { label: "Overdue", color: "bg-red-500/15 text-red-400 border-red-500/25", icon: <AlertTriangle className="h-3 w-3" /> },
  partial: { label: "Partial", color: "bg-orange-500/15 text-orange-400 border-orange-500/25", icon: <CreditCard className="h-3 w-3" /> },
  draft: { label: "Draft", color: "bg-muted text-muted-foreground border-border/50", icon: <Receipt className="h-3 w-3" /> },
};

interface CRMFinanceLinkageProps {
  entityType: "contact" | "company";
  entityId: string;
  entityName: string;
  healthScore?: number;
}

export function CRMFinanceLinkage({ entityType, entityId, entityName, healthScore }: CRMFinanceLinkageProps) {
  const invoices = useMemo(() => generateDemoInvoices(entityName), [entityName]);
  const collections = useMemo(() => generateDemoCollections(), []);
  const revenue = useMemo(() => generateDemoRevenue(), []);

  const overdueInvoices = invoices.filter(i => i.status === "overdue");
  const pendingInvoices = invoices.filter(i => i.status === "pending");
  const totalOutstanding = [...overdueInvoices, ...pendingInvoices].reduce((s, i) => s + i.amount, 0);

  return (
    <div className="space-y-4">
      {/* Revenue Snapshot */}
      <Card className="border-border/50 bg-gradient-to-br from-card to-card/80">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" /> Revenue Intelligence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-muted/20 border border-border/30 text-center">
              <p className="text-lg font-bold text-foreground">${(revenue.total_lifetime / 1000).toFixed(1)}K</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Lifetime</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/20 border border-border/30 text-center">
              <p className="text-lg font-bold text-foreground">${(revenue.last_12_months / 1000).toFixed(1)}K</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">12 Months</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/20 border border-border/30 text-center">
              <div className="flex items-center justify-center gap-1">
                <p className="text-lg font-bold text-foreground">${(revenue.last_30_days / 1000).toFixed(1)}K</p>
                {revenue.trend === "up" ? (
                  <TrendingUp className="h-3.5 w-3.5 text-green-400" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5 text-red-400" />
                )}
              </div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">30 Days</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/20 border border-border/30 text-center">
              <p className={`text-lg font-bold ${revenue.payment_reliability >= 80 ? "text-green-400" : revenue.payment_reliability >= 60 ? "text-yellow-400" : "text-red-400"}`}>
                {revenue.payment_reliability}%
              </p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Pay Reliability</p>
            </div>
          </div>

          {/* Trend indicator */}
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <Sparkles className="h-3 w-3 text-primary" />
            <span>Revenue is <span className={`font-semibold ${revenue.trend === "up" ? "text-green-400" : "text-red-400"}`}>{revenue.trend === "up" ? "↑" : "↓"} {revenue.trend_pct}%</span> compared to prior period</span>
          </div>
        </CardContent>
      </Card>

      {/* Outstanding Alert */}
      {overdueInvoices.length > 0 && (
        <div className="p-3 rounded-lg bg-red-500/8 border border-red-500/20 flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-400">{overdueInvoices.length} Overdue Invoice{overdueInvoices.length > 1 ? "s" : ""}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              ${overdueInvoices.reduce((s, i) => s + i.amount, 0).toLocaleString()} outstanding · May affect relationship health
            </p>
          </div>
          <Button variant="outline" size="sm" className="shrink-0 h-7 text-xs gap-1 border-red-500/30 text-red-400 hover:bg-red-500/10">
            <Shield className="h-3 w-3" /> Review
          </Button>
        </div>
      )}

      {/* Invoice List */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Receipt className="h-4 w-4 text-primary" /> Invoices
              {totalOutstanding > 0 && (
                <Badge variant="outline" className="text-[10px] bg-yellow-500/10 text-yellow-400 border-yellow-500/25">
                  ${totalOutstanding.toLocaleString()} outstanding
                </Badge>
              )}
            </CardTitle>
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
              <ExternalLink className="h-3 w-3" /> Finance OS
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/30">
            {invoices.map(inv => {
              const cfg = STATUS_CONFIG[inv.status];
              const daysOverdue = inv.status === "overdue" ? differenceInDays(new Date(), new Date(inv.due_at)) : 0;
              return (
                <div key={inv.id} className="px-4 py-3 hover:bg-muted/20 transition-colors cursor-pointer group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${cfg.color}`}>
                        {cfg.icon} {cfg.label}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">{inv.number}</p>
                        <p className="text-xs text-muted-foreground truncate">{inv.description}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <p className="text-sm font-semibold text-foreground">${inv.amount.toLocaleString()}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {inv.status === "paid" && inv.paid_at ? `Paid ${format(new Date(inv.paid_at), "MMM d")}` :
                         inv.status === "overdue" ? `${daysOverdue}d overdue` :
                         `Due ${format(new Date(inv.due_at), "MMM d")}`}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Collections */}
      {collections.length > 0 && (
        <Card className="border-orange-500/20 bg-orange-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-orange-400">
              <Banknote className="h-4 w-4" /> Active Collections
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {collections.map(col => (
              <div key={col.id} className="p-3 rounded-lg bg-background/50 border border-border/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">${col.amount_owed.toLocaleString()} owed</p>
                    <p className="text-xs text-muted-foreground">{col.status === "escalated" ? "⚠️ Escalated" : "In progress"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Next: {col.next_action}</p>
                    <p className="text-[10px] text-muted-foreground/60">Last action {formatDistanceToNow(new Date(col.last_action_at), { addSuffix: true })}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
