// ═══════════════════════════════════════════════════════════════
// SITA OS — Policy Simulator Hub
// Founder-safe simulation entry with quick presets
// Uses shared admin components
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SitaCard, SitaCardTitle, SitaSectionHeader } from "@/platform/sita/components/sita/SitaCard";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { AdminPageHeader, TrustRibbon, StatusBadge } from "@/platform/sita/components/sita/admin";
import { useGovernanceSimulator } from "@/contexts/SitaKernelContext";
import type { SimulationResult } from "@/lib/services/governance-simulator";
import {
  Shield, Play, AlertTriangle, CheckCircle, ChevronRight,
  DollarSign, Wifi, Users, Zap, Lock, Eye, RotateCcw, Package,
} from "lucide-react";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

interface PresetScenario {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  domain: string;
  capabilityId: string;
  riskTier: "low" | "medium" | "high" | "critical";
  amount?: number;
}

const presets: PresetScenario[] = [
  { id: "p1", name: "Large Transfer", description: "What happens if an advisor tries to move $10,000?", icon: DollarSign, domain: "finance", capabilityId: "finance.transfer", riskTier: "critical", amount: 10000 },
  { id: "p2", name: "New Connector", description: "What if we add a new connector integration?", icon: Wifi, domain: "connector", capabilityId: "connector.create", riskTier: "high" },
  { id: "p3", name: "Bulk Email", description: "What if the business advisor sends 500 emails?", icon: Users, domain: "business", capabilityId: "comms.bulk-send", riskTier: "high", amount: 500 },
  { id: "p4", name: "Budget Update", description: "What if we change the monthly budget to $8K?", icon: DollarSign, domain: "finance", capabilityId: "finance.budget.update", riskTier: "medium", amount: 8000 },
  { id: "p5", name: "CRM Contact View", description: "Can an advisor view customer records freely?", icon: Eye, domain: "business", capabilityId: "crm.contact.view", riskTier: "low" },
  { id: "p6", name: "Deploy to Production", description: "What checks happen before a production deploy?", icon: Zap, domain: "system", capabilityId: "release.deploy", riskTier: "critical" },
  { id: "p7", name: "Pack Publish", description: "What if a new pack is published to the store?", icon: Package, domain: "system", capabilityId: "pack.publish", riskTier: "high" },
  { id: "p8", name: "Rollback Release", description: "What happens if we need to roll back?", icon: RotateCcw, domain: "system", capabilityId: "release.rollback", riskTier: "critical" },
];

export default function PolicySimulatorHub() {
  const gov = useGovernanceSimulator();
  const navigate = useNavigate();
  const [results, setResults] = useState<Map<string, SimulationResult>>(new Map());

  const runPreset = (preset: PresetScenario) => {
    const result = gov.runComplianceAudit([{
      domain: preset.domain, capabilityId: preset.capabilityId,
      riskTier: preset.riskTier, amount: preset.amount,
    }]);
    setResults(new Map(results).set(preset.id, result));
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-5">
<AdminPageHeader icon={Shield} title="Policy Simulator" subtitle='Test "what if" scenarios to understand how policies protect your system'>
        <button onClick={() => navigate("/mission/policies/simulate")}
          className="flex items-center gap-2 rounded-xl border border-border bg-card/60 px-4 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
        >
          <Lock className="h-3.5 w-3.5" /> Advanced Simulator
        </button>
      </AdminPageHeader>

      <TrustRibbon />

      <SitaSectionHeader title="Quick Scenarios" subtitle="Click to simulate — see what your policies would do" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {presets.map((preset, i) => {
          const result = results.get(preset.id);
          const passed = result?.results?.[0]?.policyResult?.effect === "allow";
          const blocked = result?.results?.[0]?.policyResult?.effect === "deny";

          return (
            <motion.div key={preset.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <SitaCard hover={!result} className={cn(result ? (passed ? "border-trust-verified/20" : blocked ? "border-destructive/20" : "border-accent/20") : "")}>
                <div className="flex items-start gap-3">
                  <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl shrink-0",
                    result ? (passed ? "bg-trust-verified/10" : blocked ? "bg-destructive/10" : "bg-accent/10") : "bg-primary/10"
                  )}>
                    <preset.icon className={cn("h-5 w-5",
                      result ? (passed ? "text-trust-safe" : blocked ? "text-destructive" : "text-accent") : "text-primary"
                    )} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-xs font-semibold text-foreground">{preset.name}</p>
                      <StatusBadge status={preset.riskTier} size="xs" />
                    </div>
                    <p className="text-[11px] text-muted-foreground">{preset.description}</p>

                    {result && (
                      <div className="mt-3 rounded-lg bg-secondary/20 p-3">
                        <div className="flex items-center gap-2 mb-1">
                          {passed ? <CheckCircle className="h-3.5 w-3.5 text-trust-safe" /> :
                           blocked ? <AlertTriangle className="h-3.5 w-3.5 text-destructive" /> :
                           <Shield className="h-3.5 w-3.5 text-accent" />}
                          <span className={cn("text-xs font-semibold",
                            passed ? "text-trust-safe" : blocked ? "text-destructive" : "text-accent"
                          )}>
                            {result.results[0]?.policyResult?.effect?.toUpperCase()}
                          </span>
                        </div>
                        {result.results[0]?.policyResult?.reason && (
                          <p className="text-[10px] text-muted-foreground">{result.results[0].policyResult.reason}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex justify-end">
                  {!result ? (
                    <button onClick={() => runPreset(preset)}
                      className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-[11px] font-medium text-primary hover:bg-primary/20 transition-colors"
                    >
                      <Play className="h-3 w-3" /> Simulate
                    </button>
                  ) : (
                    <button onClick={() => setResults(r => { const n = new Map(r); n.delete(preset.id); return n; })}
                      className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                    >Reset</button>
                  )}
                </div>
              </SitaCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
