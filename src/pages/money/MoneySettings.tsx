import { SitaPageHeader, SitaCard, SitaCardTitle, SitaSectionHeader } from "@/components/sita/SitaCard";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { Shield, Bell, DollarSign, PiggyBank, CreditCard, Zap, Link, AlertTriangle, CheckCircle, Settings } from "lucide-react";
import { motion } from "framer-motion";

interface PolicyRule {
  id: string;
  title: string;
  description: string;
  category: string;
  enabled: boolean;
  threshold?: string;
  icon: typeof Shield;
}

const policies: PolicyRule[] = [
  { id: "1", title: "Transfer approval threshold", description: "Require approval for transfers exceeding this amount", category: "Approvals", enabled: true, threshold: "$500", icon: Shield },
  { id: "2", title: "Tax payment approval", description: "Require approval for tax payments above this amount", category: "Approvals", enabled: true, threshold: "$1,000", icon: DollarSign },
  { id: "3", title: "Low balance alert", description: "Alert when any account drops below threshold", category: "Alerts", enabled: true, threshold: "$4,000", icon: AlertTriangle },
  { id: "4", title: "Subscription waste detection", description: "Flag subscriptions with low usage automatically", category: "Intelligence", enabled: true, icon: CreditCard },
  { id: "5", title: "Auto-pay confirmation", description: "Notify before auto-pay executes for bills over threshold", category: "Alerts", enabled: true, threshold: "$500", icon: Bell },
  { id: "6", title: "Reserve auto-contribution", description: "Automatically contribute to savings goals monthly", category: "Automation", enabled: true, icon: PiggyBank },
  { id: "7", title: "Cash timing stress alerts", description: "Warn when single-day outflows exceed threshold", category: "Alerts", enabled: true, threshold: "$3,000", icon: Zap },
  { id: "8", title: "Overdue receivable reminders", description: "Auto-send follow-up after specified days overdue", category: "Automation", enabled: true, threshold: "7 days", icon: Bell },
];

const connectors = [
  { name: "Chase Business", type: "Banking", status: "connected" as const, lastSync: "2 hours ago" },
  { name: "Wells Fargo", type: "Banking", status: "connected" as const, lastSync: "2 hours ago" },
  { name: "Ally Savings", type: "Banking", status: "connected" as const, lastSync: "3 hours ago" },
  { name: "QuickBooks", type: "Accounting", status: "connected" as const, lastSync: "1 hour ago" },
  { name: "Stripe", type: "Payments", status: "connected" as const, lastSync: "Real-time" },
  { name: "Google Drive", type: "Documents", status: "not-connected" as const, lastSync: "" },
  { name: "Payroll Provider", type: "Payroll", status: "not-connected" as const, lastSync: "" },
];

const categories = [...new Set(policies.map(p => p.category))];

const MoneySettings = () => {
  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <SitaPageHeader title="Money Settings & Rules" subtitle="Policies, thresholds, automation rules, and connected services" />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Policy Rules */}
        <div className="space-y-6">
          {categories.map((cat) => (
            <div key={cat} className="space-y-3">
              <SitaSectionHeader title={cat} />
              {policies.filter(p => p.category === cat).map((policy) => (
                <SitaCard key={policy.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-primary/8 p-2 shrink-0 mt-0.5">
                      <policy.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-foreground">{policy.title}</p>
                        <div className={`relative h-5 w-9 rounded-full transition-colors cursor-pointer ${policy.enabled ? "bg-primary" : "bg-secondary"}`}>
                          <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${policy.enabled ? "translate-x-4" : "translate-x-0.5"}`} />
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{policy.description}</p>
                      {policy.threshold && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground">Threshold:</span>
                          <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-foreground">{policy.threshold}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </SitaCard>
              ))}
            </div>
          ))}
        </div>

        {/* Connectors */}
        <div className="space-y-6">
          <div className="space-y-3">
            <SitaSectionHeader title="Connected Services" subtitle="Data sources and integrations" />
            {connectors.map((c, i) => (
              <SitaCard key={i} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-xl p-2 ${c.status === "connected" ? "bg-trust-verified/8" : "bg-secondary/50"}`}>
                      <Link className={`h-4 w-4 ${c.status === "connected" ? "text-trust-verified" : "text-muted-foreground"}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {c.status === "connected" ? (
                      <>
                        <TrustBadge level="verified" label="Connected" size="sm" />
                        <p className="text-[10px] text-muted-foreground mt-0.5">Synced {c.lastSync}</p>
                      </>
                    ) : (
                      <button className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors">Connect</button>
                    )}
                  </div>
                </div>
              </SitaCard>
            ))}
          </div>

          {/* Data Privacy */}
          <SitaCard hover={false} className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-4 w-4 text-primary" />
              <SitaCardTitle>Data & Privacy</SitaCardTitle>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Financial data encryption</span>
                <TrustBadge level="verified" label="Active" size="sm" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Sensitive document protection</span>
                <TrustBadge level="verified" label="Active" size="sm" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Proof audit trail</span>
                <TrustBadge level="verified" label="Enabled" size="sm" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Data retention</span>
                <span className="rounded-md bg-secondary px-2 py-0.5 text-xs text-foreground">7 years</span>
              </div>
            </div>
          </SitaCard>
        </div>
      </div>
    </motion.div>
  );
};

export default MoneySettings;
