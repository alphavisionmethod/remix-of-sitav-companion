// ═══════════════════════════════════════════════════════════════
// SITA OS — Mission Registry & Control Plane
// Operational inventory: workflows, advisors, packs, policies,
// releases, environments, capabilities, services
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { SitaCard, SitaCardTitle, SitaSectionHeader } from "@/platform/sita/components/sita/SitaCard";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Database, Workflow, Users, Package, Shield, Rocket, Server,
  Zap, Search, CheckCircle, AlertTriangle, Eye, Layers, Globe,
  Settings, Activity, Lock,
} from "lucide-react";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

interface RegistryItem {
  id: string;
  name: string;
  type: string;
  status: "active" | "inactive" | "degraded" | "deprecated";
  domain?: string;
  trustLevel?: string;
  lastUpdated: string;
}

const registryData: Record<string, RegistryItem[]> = {
  workflows: [
    { id: "wf-inv", name: "Invoice Processing", type: "workflow", status: "active", domain: "finance", trustLevel: "high", lastUpdated: "2h ago" },
    { id: "wf-lead", name: "Lead Qualification", type: "workflow", status: "active", domain: "business", trustLevel: "medium", lastUpdated: "1h ago" },
    { id: "wf-onb", name: "Customer Onboarding", type: "workflow", status: "active", domain: "business", trustLevel: "high", lastUpdated: "3h ago" },
    { id: "wf-rec", name: "Expense Reconciliation", type: "workflow", status: "degraded", domain: "finance", trustLevel: "high", lastUpdated: "30m ago" },
  ],
  advisors: [
    { id: "adv-money", name: "Money Advisor", type: "advisor", status: "active", domain: "finance", trustLevel: "high", lastUpdated: "5m ago" },
    { id: "adv-biz", name: "Business Advisor", type: "advisor", status: "active", domain: "business", trustLevel: "high", lastUpdated: "12m ago" },
    { id: "adv-life", name: "Life Advisor", type: "advisor", status: "active", domain: "concierge", trustLevel: "medium", lastUpdated: "1h ago" },
    { id: "adv-ops", name: "Operations Advisor", type: "advisor", status: "active", domain: "system", trustLevel: "high", lastUpdated: "3m ago" },
  ],
  packs: [
    { id: "pk-found", name: "Founder Pack", type: "pack", status: "active", lastUpdated: "1d ago" },
    { id: "pk-fam", name: "Family Pack", type: "pack", status: "active", lastUpdated: "2d ago" },
    { id: "pk-ent", name: "Enterprise Pack", type: "pack", status: "inactive", lastUpdated: "5d ago" },
  ],
  policies: [
    { id: "pol-spend", name: "Spend Limits", type: "policy", status: "active", domain: "finance", lastUpdated: "1h ago" },
    { id: "pol-data", name: "Data Classification", type: "policy", status: "active", domain: "security", lastUpdated: "3h ago" },
    { id: "pol-comms", name: "Communication Governance", type: "policy", status: "active", domain: "business", lastUpdated: "6h ago" },
    { id: "pol-deploy", name: "Deployment Policy", type: "policy", status: "active", domain: "system", lastUpdated: "2d ago" },
  ],
  releases: [
    { id: "rel-241", name: "v2.4.1 — Connector Improvements", type: "release", status: "active", lastUpdated: "2h ago" },
    { id: "rel-240", name: "v2.4.0 — Trust Ladder", type: "release", status: "active", lastUpdated: "3d ago" },
    { id: "rel-239", name: "v2.3.9 — Hotfix: Receipt Chain", type: "release", status: "deprecated", lastUpdated: "1w ago" },
  ],
  services: [
    { id: "svc-brain", name: "Brain Core", type: "service", status: "active", lastUpdated: "1m ago" },
    { id: "svc-policy", name: "Policy Engine", type: "service", status: "active", lastUpdated: "1m ago" },
    { id: "svc-receipt", name: "Receipt Service", type: "service", status: "active", lastUpdated: "1m ago" },
    { id: "svc-wf", name: "Workflow Engine", type: "service", status: "degraded", lastUpdated: "5m ago" },
    { id: "svc-conn", name: "Connector Gateway", type: "service", status: "active", lastUpdated: "2m ago" },
    { id: "svc-model", name: "Model Router", type: "service", status: "active", lastUpdated: "1m ago" },
  ],
  capabilities: [
    { id: "cap-transfer", name: "finance.transfer", type: "capability", status: "active", domain: "finance", trustLevel: "critical", lastUpdated: "1h ago" },
    { id: "cap-email", name: "comms.bulk-send", type: "capability", status: "active", domain: "business", trustLevel: "high", lastUpdated: "2h ago" },
    { id: "cap-deploy", name: "release.deploy", type: "capability", status: "active", domain: "system", trustLevel: "critical", lastUpdated: "1d ago" },
    { id: "cap-export", name: "data.export", type: "capability", status: "active", domain: "security", trustLevel: "high", lastUpdated: "3h ago" },
  ],
};

const tabConfig = [
  { key: "workflows", label: "Workflows", icon: Workflow },
  { key: "advisors", label: "Advisors", icon: Users },
  { key: "services", label: "Services", icon: Server },
  { key: "policies", label: "Policies", icon: Shield },
  { key: "capabilities", label: "Capabilities", icon: Zap },
  { key: "packs", label: "Packs", icon: Package },
  { key: "releases", label: "Releases", icon: Rocket },
];

const statusDot = (s: string) => s === "active" ? "bg-trust-safe" : s === "degraded" ? "bg-accent" : s === "deprecated" ? "bg-muted-foreground" : "bg-muted-foreground";

export default function MissionRegistryPage() {
  const [search, setSearch] = useState("");

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-6">
<motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/5 via-card to-card p-6"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 shadow-lg shadow-primary/10">
            <Database className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">System Registry</h1>
            <p className="text-sm text-muted-foreground">Operational inventory — workflows, advisors, services, policies, capabilities</p>
          </div>
        </div>
      </motion.div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search registry..." value={search} onChange={e => setSearch(e.target.value)}
          className="pl-10 bg-secondary/30 border-border/50 rounded-xl" />
      </div>

      <Tabs defaultValue="workflows" className="space-y-4">
        <TabsList className="bg-secondary/30 p-1 rounded-xl flex-wrap h-auto gap-1">
          {tabConfig.map(t => (
            <TabsTrigger key={t.key} value={t.key} className="rounded-lg text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <t.icon className="h-3.5 w-3.5 mr-1.5" />{t.label} ({registryData[t.key]?.length ?? 0})
            </TabsTrigger>
          ))}
        </TabsList>

        {tabConfig.map(t => (
          <TabsContent key={t.key} value={t.key}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(registryData[t.key] ?? [])
                .filter(item => !search || item.name.toLowerCase().includes(search.toLowerCase()))
                .map((item, i) => (
                <motion.div key={item.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                  <SitaCard hover className={cn(item.status === "degraded" ? "border-accent/20" : item.status === "deprecated" ? "border-muted/20" : "")}>
                    <div className="flex items-center gap-3">
                      <div className={cn("h-2.5 w-2.5 rounded-full shrink-0", statusDot(item.status))} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-semibold text-foreground truncate">{item.name}</p>
                          {item.domain && <Badge variant="outline" className="text-[9px]">{item.domain}</Badge>}
                          {item.trustLevel && <Badge variant="outline" className={cn("text-[9px]",
                            item.trustLevel === "critical" ? "bg-destructive/10 text-destructive" :
                            item.trustLevel === "high" ? "bg-accent/10 text-accent" : ""
                          )}>{item.trustLevel}</Badge>}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Updated {item.lastUpdated}</p>
                      </div>
                      <Badge variant="outline" className="text-[9px] shrink-0">{item.status}</Badge>
                    </div>
                  </SitaCard>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
