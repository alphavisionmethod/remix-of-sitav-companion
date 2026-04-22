import { TrustBadge } from "@/components/sita/TrustBadge";
import { SectionSkeleton } from "@/components/sita/SectionSkeleton";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { SITA_TYPE } from "@/platform/design-system/sita-design-tokens";
import { StatusCard, SummaryCard } from "@/components/sita/cards";
import { Shield, Bell, DollarSign, PiggyBank, CreditCard, Zap, Link, AlertTriangle, CheckCircle, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { useMoneyPolicies, useToggleMoneyPolicy } from "@/hooks/use-domain-data";
import { useMemo } from "react";
import { toast } from "sonner";
import { AdvisorKnowledgePanel } from "@/components/advisors/AdvisorKnowledgePanel";
const iconMap: Record<string, typeof Shield> = {
  Shield, Bell, DollarSign, PiggyBank, CreditCard, Zap, AlertTriangle, Settings,
};

const MoneySettings = () => {
  const { data: policies = [], isLoading } = useMoneyPolicies();
  const toggleMut = useToggleMoneyPolicy();

  const categories = useMemo(() => [...new Set(policies.map((p: Record<string, any>) => p.category))], [policies]);

  const handleToggle = (id: string, currentEnabled: boolean) => {
    toggleMut.mutate({ id, enabled: !currentEnabled }, {
      onSuccess: () => toast.success(`Policy ${!currentEnabled ? "enabled" : "disabled"}`),
    });
  };

  if (isLoading) return <SectionSkeleton cards={4} columns={2} />;

  return (
    <motion.div className="space-y-6 p-1" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <PageTruthBanner />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Policy Rules */}
        <div className="space-y-6">
          {categories.map((cat: string) => (
            <div key={cat} className="space-y-3">
              <h3 className={SITA_TYPE.microLabel + " text-[hsl(0_0%_50%)] uppercase tracking-wider"}>{cat}</h3>
              {policies.filter((p: Record<string, any>) => p.category === cat).map((policy: Record<string, any>) => {
                const Icon = iconMap[policy.icon_key || ""] || Shield;
                return (
                  <div key={policy.id} className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-4 micro-hover-lift">
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-[hsl(265_55%_58%/0.08)] p-2 shrink-0 mt-0.5">
                        <Icon className="h-4 w-4 text-[hsl(265_55%_58%)]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={SITA_TYPE.cardTitle + " text-[hsl(0_0%_85%)]"}>{policy.title}</p>
                          <button
                            onClick={() => handleToggle(policy.id, policy.enabled)}
                            className={`relative h-5 w-9 rounded-full transition-colors cursor-pointer ${policy.enabled ? "bg-[hsl(152_55%_48%)]" : "bg-[hsl(0_0%_25%)]"}`}
                          >
                            <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${policy.enabled ? "translate-x-4" : "translate-x-0.5"}`} />
                          </button>
                        </div>
                        <p className={SITA_TYPE.timelineMeta + " mt-0.5"}>{policy.description}</p>
                        {policy.threshold != null && (
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-[10px] text-[hsl(0_0%_45%)]">Threshold:</span>
                            <span className="rounded-md bg-[hsl(0_0%_100%/0.06)] px-2 py-0.5 text-xs font-medium text-[hsl(0_0%_85%)]">${policy.threshold}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Connectors & Privacy */}
        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className={SITA_TYPE.microLabel + " text-[hsl(0_0%_50%)] uppercase tracking-wider"}>Connected Services</h3>
            {([] as typeof DEMO_CONNECTORS).map((c, i) => (
              <StatusCard
                key={i}
                label={c.name}
                status={c.status === "connected" ? "healthy" : "unknown"}
                lastChecked={c.status === "connected" ? `Synced ${c.lastSync}` : undefined}
                className="micro-hover-lift"
              />
            ))}
          </div>

          <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-5">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-4 w-4 text-[hsl(265_55%_58%)]" />
              <h4 className={SITA_TYPE.cardTitle + " text-[hsl(0_0%_85%)]"}>Data & Privacy</h4>
            </div>
            <div className="space-y-3">
              {["Financial data encryption", "Sensitive document protection", "Proof audit trail"].map(label => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-sm text-[hsl(0_0%_70%)]">{label}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[hsl(152_55%_48%/0.12)] text-[hsl(152_55%_48%)]">Active</span>
                </div>
              ))}
              <div className="flex items-center justify-between">
                <span className="text-sm text-[hsl(0_0%_70%)]">Data retention</span>
                <span className="rounded-md bg-[hsl(0_0%_100%/0.06)] px-2 py-0.5 text-xs text-[hsl(0_0%_85%)]">7 years</span>
              </div>
            </div>
          </div>

          <AdvisorKnowledgePanel advisorId="money-advisor" domain="money" title="Money Advisor Knowledge" />
        </div>
      </div>
    </motion.div>
  );
};

export default MoneySettings;
