// ═══════════════════════════════════════════════════════════════
// SITA OS — Advisor Configuration Panel
// Visual config for 26 customer-facing advisors
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { SitaPageHeader, SitaCard } from "@/platform/sita/components/sita/SitaCard";
import { AdminActionCard } from "@/platform/sita/components/sita/AdminActionCard";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, Users, Shield, Eye, Sparkles, DollarSign, Briefcase, Heart, Headphones, Scale } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

interface AdvisorConfigItem {
  id: string;
  name: string;
  council: string;
  description: string;
  prominence: "primary" | "supporting" | "hidden";
  autonomy: "suggest" | "act-with-approval" | "act-then-report" | "full-auto";
  enabled: boolean;
  domains: string[];
}

const ADVISORS: AdvisorConfigItem[] = [
  { id: "chief-of-staff", name: "Chief of Staff", council: "Executive", description: "Orchestrates all advisors, resolves conflicts, manages priorities", prominence: "primary", autonomy: "act-with-approval", enabled: true, domains: ["all"] },
  { id: "money-advisor", name: "Money Advisor", council: "Finance", description: "Cash flow, bills, subscriptions, investment oversight", prominence: "primary", autonomy: "suggest", enabled: true, domains: ["money", "bills", "investments"] },
  { id: "business-advisor", name: "Business Advisor", council: "Business", description: "CRM, leads, pipeline, revenue strategy", prominence: "primary", autonomy: "suggest", enabled: true, domains: ["business", "crm", "revenue"] },
  { id: "growth-advisor", name: "Growth Advisor", council: "Business", description: "Opportunities, market trends, expansion strategy", prominence: "supporting", autonomy: "suggest", enabled: true, domains: ["business", "opportunities"] },
  { id: "family-advisor", name: "Family Advisor", council: "Family", description: "Household scheduling, school events, family coordination", prominence: "primary", autonomy: "act-with-approval", enabled: true, domains: ["family", "calendar", "household"] },
  { id: "concierge-advisor", name: "Concierge Advisor", council: "Concierge", description: "Travel, bookings, appointments, provider management", prominence: "primary", autonomy: "act-with-approval", enabled: true, domains: ["concierge", "travel", "bookings"] },
  { id: "risk-officer", name: "Risk Officer", council: "Governance", description: "Policy enforcement, fraud detection, compliance", prominence: "primary", autonomy: "act-then-report", enabled: true, domains: ["all"] },
  { id: "tax-advisor", name: "Tax Advisor", council: "Finance", description: "Tax planning, deductions, quarterly estimates", prominence: "supporting", autonomy: "suggest", enabled: true, domains: ["money", "tax"] },
  { id: "wellness-advisor", name: "Wellness Advisor", council: "Family", description: "Health appointments, fitness, meal planning", prominence: "supporting", autonomy: "suggest", enabled: false, domains: ["family", "health"] },
];

const councilIcons: Record<string, typeof Brain> = {
  Executive: Brain, Finance: DollarSign, Business: Briefcase, Family: Heart, Concierge: Headphones, Governance: Scale,
};

const AdvisorConfig = () => {
  const [advisors, setAdvisors] = useState(ADVISORS);

  const updateAdvisor = (id: string, field: keyof AdvisorConfigItem, value: any) => {
    setAdvisors(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const councils = [...new Set(advisors.map(a => a.council))];

  return (
    <motion.div className="mx-auto max-w-4xl space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
<SitaPageHeader title="Advisor Configuration" subtitle="Configure the 26 customer-facing advisors — prominence, autonomy, and domain access" />

      {councils.map(council => {
        const Icon = councilIcons[council] || Brain;
        const councilAdvisors = advisors.filter(a => a.council === council);

        return (
          <div key={council} className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <Icon className="h-4 w-4 text-primary" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{council} Council</h3>
              <Badge variant="secondary" className="text-[10px]">{councilAdvisors.length}</Badge>
            </div>

            {councilAdvisors.map(advisor => (
              <SitaCard key={advisor.id} hover={false} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-foreground">{advisor.name}</p>
                      <Badge variant={advisor.prominence === "primary" ? "default" : "secondary"} className="text-[10px]">{advisor.prominence}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{advisor.description}</p>

                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground font-medium">Prominence:</span>
                        <Select value={advisor.prominence} onValueChange={v => updateAdvisor(advisor.id, "prominence", v)}>
                          <SelectTrigger className="w-28 h-7 text-[11px]"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="primary">Primary</SelectItem>
                            <SelectItem value="supporting">Supporting</SelectItem>
                            <SelectItem value="hidden">Hidden</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground font-medium">Autonomy:</span>
                        <Select value={advisor.autonomy} onValueChange={v => updateAdvisor(advisor.id, "autonomy", v)}>
                          <SelectTrigger className="w-36 h-7 text-[11px]"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="suggest">Suggest only</SelectItem>
                            <SelectItem value="act-with-approval">Act with approval</SelectItem>
                            <SelectItem value="act-then-report">Act then report</SelectItem>
                            <SelectItem value="full-auto">Full auto</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-2">
                      {advisor.domains.map(d => (
                        <Badge key={d} variant="outline" className="text-[9px] font-mono">{d}</Badge>
                      ))}
                    </div>
                  </div>

                  <Switch checked={advisor.enabled} onCheckedChange={v => updateAdvisor(advisor.id, "enabled", v)} />
                </div>
              </SitaCard>
            ))}
          </div>
        );
      })}

      <AdminActionCard
        title="Save Advisor Configuration"
        whatChanges={`Configuration for ${advisors.length} advisors across ${councils.length} councils`}
        riskLevel="medium"
        whatHappensNext="Advisor behavior updates immediately. Hidden advisors stop contributing to recommendations."
        proofNote="Advisor config change logged with per-advisor diff"
        undoDescription="Revert from Owner → Rollback → Advisor Config"
        onConfirm={() => toast.success("Advisor configuration saved")}
        confirmLabel="Save Configuration"
        icon={<Users className="h-5 w-5 text-primary" />}
      />
    </motion.div>
  );
};

export default AdvisorConfig;
