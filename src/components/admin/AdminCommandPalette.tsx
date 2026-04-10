import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator
} from "@/components/ui/command";
import {
  Activity, AlertTriangle, Brain, Crown, Database, Eye, GitBranch, Globe,
  Layers, Link2, Lock, Rocket, Server, Shield, Target, TrendingUp, Zap,
  BarChart3, Cpu, FileText, Play, RefreshCw, Settings, Search, Scale,
  DollarSign, Receipt, RotateCcw
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Mission Control", path: "/admin/mission-control", icon: Activity, group: "Navigation" },
  { label: "Intelligence Dashboard", path: "/admin/intelligence", icon: Brain, group: "Navigation" },
  { label: "Incidents", path: "/admin/incidents", icon: AlertTriangle, group: "Navigation" },
  { label: "Operations Hub", path: "/admin/operations", icon: Zap, group: "Navigation" },
  { label: "Alert Triage", path: "/admin/alert-triage", icon: AlertTriangle, group: "Navigation" },
  { label: "Deployment Truth", path: "/admin/deployment", icon: GitBranch, group: "Navigation" },
  { label: "Release Rings", path: "/admin/release-ring", icon: Rocket, group: "Navigation" },
  { label: "Proof Matrix", path: "/admin/proof-matrix", icon: Layers, group: "Navigation" },
  { label: "Chain Explorer", path: "/admin/chain-explorer", icon: Link2, group: "Navigation" },
  { label: "Projections", path: "/admin/projections", icon: BarChart3, group: "Navigation" },
  { label: "Durability Board", path: "/admin/durability", icon: Database, group: "Navigation" },
  { label: "Connectors", path: "/admin/connectors", icon: Globe, group: "Navigation" },
  { label: "Fleet Health", path: "/admin/fleet-health", icon: Cpu, group: "Navigation" },
  { label: "Security Posture", path: "/admin/security-posture", icon: Lock, group: "Navigation" },
  { label: "Truth Registry", path: "/admin/truth-registry", icon: Eye, group: "Navigation" },
  { label: "Launch Readiness", path: "/admin/launch-readiness", icon: Target, group: "Navigation" },
  { label: "Founder Council", path: "/admin/founder-council", icon: Crown, group: "Navigation" },
  { label: "Concierge Runtime", path: "/admin/concierge-runtime", icon: Server, group: "Navigation" },
  { label: "Policy Simulator", path: "/admin/policy-simulator", icon: Shield, group: "Navigation" },
  { label: "Workflow Replay", path: "/admin/workflow-replay", icon: Play, group: "Navigation" },
  { label: "Implementation Truth Center", path: "/admin/implementation-truth", icon: Eye, group: "Navigation" },
  { label: "ITC: Spec Registry", path: "/admin/implementation-truth/specs", icon: FileText, group: "Navigation" },
  { label: "ITC: Contracts", path: "/admin/implementation-truth/contracts", icon: Shield, group: "Navigation" },
  { label: "ITC: Wiring Graph", path: "/admin/implementation-truth/wiring", icon: GitBranch, group: "Navigation" },
  { label: "ITC: Readiness", path: "/admin/implementation-truth/readiness", icon: BarChart3, group: "Navigation" },
  { label: "ITC: Drift Radar", path: "/admin/implementation-truth/drift", icon: Activity, group: "Navigation" },
  { label: "ITC: Implementation Map", path: "/admin/implementation-truth/map", icon: Layers, group: "Navigation" },
  { label: "ITC: Architecture", path: "/admin/implementation-truth/architecture", icon: Cpu, group: "Navigation" },
  { label: "ITC: Route Inventory", path: "/admin/implementation-truth/routes", icon: Globe, group: "Navigation" },
  { label: "ITC: Runtime Evidence", path: "/admin/implementation-truth/runtime", icon: Zap, group: "Navigation" },
  { label: "ITC: Prompt Traceability", path: "/admin/implementation-truth/prompts", icon: FileText, group: "Navigation" },
  { label: "ITC: Validation Pipeline", path: "/admin/implementation-truth/pipeline", icon: Activity, group: "Navigation" },
  { label: "ITC: Launch Truth Gate", path: "/admin/implementation-truth/launch-gate", icon: Target, group: "Navigation" },
  { label: "ITC: Feature Manifests", path: "/admin/implementation-truth/manifests", icon: Layers, group: "Navigation" },
  { label: "Button & CTA Health", path: "/admin/verification/buttons", icon: Target, group: "Navigation" },
  { label: "Page Load Integrity", path: "/admin/verification/page-load", icon: Globe, group: "Navigation" },
  { label: "Journey Verification Overview", path: "/admin/verification/overview", icon: Activity, group: "Navigation" },
  { label: "Runtime Probe Center", path: "/admin/verification/probes", icon: Zap, group: "Navigation" },
  { label: "Launch Interaction Gate", path: "/admin/verification/launch-gate", icon: Target, group: "Navigation" },
  { label: "PLE: Platform Law Overview", path: "/admin/platform-law", icon: Shield, group: "Navigation" },
  { label: "PLE: Architecture Law Registry", path: "/admin/platform-law/laws", icon: Scale, group: "Navigation" },
  { label: "PLE: Scaffold & Generator Registry", path: "/admin/platform-law/scaffolds", icon: Cpu, group: "Navigation" },
  { label: "PLE: CI & PR Gate Monitor", path: "/admin/platform-law/ci-gates", icon: GitBranch, group: "Navigation" },
  { label: "PLE: Manifest Enforcer", path: "/admin/platform-law/manifests", icon: FileText, group: "Navigation" },
  { label: "PLE: Ownership Board", path: "/admin/platform-law/ownership", icon: Crown, group: "Navigation" },
  { label: "PLE: Compliance Dashboard", path: "/admin/platform-law/compliance", icon: Layers, group: "Navigation" },
  { label: "PLT: Violation Triage", path: "/admin/platform-law/violations", icon: AlertTriangle, group: "Navigation" },
  { label: "PLT: Feature Compliance", path: "/admin/platform-law/feature-compliance", icon: Target, group: "Navigation" },
  { label: "PLT: Launch Enforcement", path: "/admin/platform-law/launch-enforcement", icon: Rocket, group: "Navigation" },
  { label: "PLT: Drift Radar", path: "/admin/platform-law/drift-radar", icon: Activity, group: "Navigation" },
  { label: "RCP: Overview", path: "/admin/reality-audit/overview", icon: Activity, group: "Reality Conversion" },
  { label: "RCP: Classification Matrix", path: "/admin/reality-audit", icon: Eye, group: "Reality Conversion" },
  { label: "RCP: Mock Replacement Board", path: "/admin/reality-audit/mock-replacement", icon: RefreshCw, group: "Reality Conversion" },
  { label: "RCP: Mock Source Inventory", path: "/admin/reality-audit/mock-sources", icon: Eye, group: "Reality Conversion" },
  { label: "RCP: Core Services", path: "/admin/reality-audit/core-persistence", icon: Database, group: "Reality Conversion" },
  { label: "RCP: Route Heatmap", path: "/admin/reality-audit/route-heatmap", icon: Target, group: "Reality Conversion" },
  { label: "RCP: Contract Readiness", path: "/admin/reality-audit/contract-readiness", icon: Shield, group: "Reality Conversion" },
  { label: "RCP: Launch Honesty", path: "/admin/reality-audit/launch-honesty", icon: Target, group: "Reality Conversion" },
  { label: "RCP: Wave Planner", path: "/admin/reality-audit/wave-planner", icon: Activity, group: "Reality Conversion" },
  { label: "RCP: Progress Timeline", path: "/admin/reality-audit/progress", icon: Activity, group: "Reality Conversion" },
  { label: "RCP: Runtime Validation", path: "/admin/reality-audit/runtime-truth", icon: Shield, group: "Reality Conversion" },
  { label: "CPS: Core Persistence Overview", path: "/admin/core-persistence", icon: Database, group: "Core Persistence" },
  { label: "CPS: Event Stream Explorer", path: "/admin/event-stream", icon: Activity, group: "Core Persistence" },
  { label: "CPS: Memory Continuity", path: "/admin/memory-continuity", icon: Brain, group: "Core Persistence" },
  { label: "CPS: Policy Decision Ledger", path: "/admin/policy-ledger", icon: Shield, group: "Core Persistence" },
  { label: "CPS: Intelligence Library", path: "/admin/intelligence-library", icon: Layers, group: "Core Persistence" },
  { label: "CPS: Action Lineage", path: "/admin/action-lineage", icon: Layers, group: "Core Persistence" },
  { label: "CPS: Replay Console", path: "/admin/replay-console", icon: Play, group: "Core Persistence" },
  { label: "CPS: Service Migration", path: "/admin/service-migration", icon: Server, group: "Core Persistence" },
  { label: "CPS: Persistence Drift", path: "/admin/persistence-drift", icon: AlertTriangle, group: "Core Persistence" },
  { label: "CPS: Runtime Continuity", path: "/admin/runtime-continuity", icon: RefreshCw, group: "Core Persistence" },
  { label: "FIP: Intake Desk", path: "/admin/fip/intake", icon: FileText, group: "Feature Integration" },
  { label: "FIP: Spec Studio", path: "/admin/fip/spec-studio", icon: FileText, group: "Feature Integration" },
  { label: "FIP: Owner Boundary", path: "/admin/fip/owner-boundary", icon: Crown, group: "Feature Integration" },
  { label: "FIP: Capability Registry", path: "/admin/fip/capability-registry", icon: Layers, group: "Feature Integration" },
  { label: "FIP: Compliance Board", path: "/admin/fip/compliance", icon: Shield, group: "Feature Integration" },
  { label: "FIP: Execution Paths", path: "/admin/fip/execution-paths", icon: Zap, group: "Feature Integration" },
  { label: "FIP: Policy & Trust", path: "/admin/fip/policy-trust", icon: Lock, group: "Feature Integration" },
  { label: "FIP: Memory & Graph", path: "/admin/fip/memory-graph", icon: Brain, group: "Feature Integration" },
  { label: "FIP: Observability", path: "/admin/fip/observability", icon: Activity, group: "Feature Integration" },
  { label: "FIP: Rollout Planner", path: "/admin/fip/rollout", icon: Rocket, group: "Feature Integration" },
  { label: "FIP: Generated Truth", path: "/admin/fip/generated-truth", icon: Database, group: "Feature Integration" },
  { label: "FIP: Readiness Gates", path: "/admin/fip/readiness", icon: Target, group: "Feature Integration" },
  { label: "FIP: Deprecation", path: "/admin/fip/deprecation", icon: AlertTriangle, group: "Feature Integration" },
  { label: "FIP: Builder Console", path: "/admin/fip/builder", icon: Cpu, group: "Feature Integration" },
  { label: "SAG: Overview", path: "/admin/sag/overview", icon: Brain, group: "Sovereign AI Gateway" },
  { label: "SAG: Model Registry", path: "/admin/sag/models", icon: Database, group: "Sovereign AI Gateway" },
  { label: "SAG: Routing Policy", path: "/admin/sag/routing", icon: GitBranch, group: "Sovereign AI Gateway" },
  { label: "SAG: Provider Health", path: "/admin/sag/health", icon: Activity, group: "Sovereign AI Gateway" },
  { label: "SAG: Prompt Registry", path: "/admin/sag/prompts", icon: Layers, group: "Sovereign AI Gateway" },
  { label: "SAG: Economics Board", path: "/admin/sag/economics", icon: DollarSign, group: "Sovereign AI Gateway" },
  { label: "SAG: Cost-Confidence Lab", path: "/admin/sag/cost-confidence", icon: TrendingUp, group: "Sovereign AI Gateway" },
  { label: "SAG: Multi-Stage Explorer", path: "/admin/sag/multi-stage", icon: GitBranch, group: "Sovereign AI Gateway" },
  { label: "SAG: Receipt Explorer", path: "/admin/sag/receipts", icon: Receipt, group: "Sovereign AI Gateway" },
  { label: "SAG: Fallback Center", path: "/admin/sag/fallback", icon: RotateCcw, group: "Sovereign AI Gateway" },
  { label: "SAG: Builder Console", path: "/admin/sag/builder", icon: Cpu, group: "Sovereign AI Gateway" },
  { label: "SAG: Compliance Gate", path: "/admin/sag/compliance", icon: Shield, group: "Sovereign AI Gateway" },
  { label: "AIG: Provider Registry", path: "/admin/aig/providers", icon: Server, group: "Sovereign AI Gateway" },
  { label: "AIG: Model Registry", path: "/admin/aig/models", icon: Database, group: "Sovereign AI Gateway" },
  { label: "AIG: Routing Matrix", path: "/admin/aig/routing", icon: GitBranch, group: "Sovereign AI Gateway" },
  { label: "AIG: Budget Center", path: "/admin/aig/budget", icon: DollarSign, group: "Sovereign AI Gateway" },
  { label: "AIG: Receipts Explorer", path: "/admin/aig/receipts", icon: Receipt, group: "Sovereign AI Gateway" },
  { label: "AIG: Launch Truth", path: "/admin/aig/launch-truth", icon: Target, group: "Sovereign AI Gateway" },
  { label: "AIG: Launch Truth Detail", path: "/admin/aig/launch-truth-detail", icon: Eye, group: "Sovereign AI Gateway" },
  { label: "AIG: Degraded Diagnostics", path: "/admin/aig/degraded", icon: AlertTriangle, group: "Sovereign AI Gateway" },
  { label: "AIG: Runtime Verification", path: "/admin/aig/runtime-verification", icon: Shield, group: "Sovereign AI Gateway" },
];

const ACTION_ITEMS = [
  { label: "Refresh Platform State", action: "refresh", icon: RefreshCw, group: "Actions" },
  { label: "Export Evidence Bundle", action: "export", icon: FileText, group: "Actions" },
  { label: "Run Diagnostics", action: "diagnostics", icon: Search, group: "Actions" },
  { label: "Open Settings", action: "settings", icon: Settings, group: "Actions" },
];

export function AdminCommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(o => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleNavSelect = useCallback((path: string) => {
    setOpen(false);
    navigate(path);
  }, [navigate]);

  const handleActionSelect = useCallback((action: string) => {
    setOpen(false);
    if (action === "refresh") window.location.reload();
    if (action === "settings") navigate("/settings");
  }, [navigate]);

  const groups = NAV_ITEMS.reduce<Record<string, typeof NAV_ITEMS>>((acc, item) => {
    (acc[item.group] ??= []).push(item);
    return acc;
  }, {});

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {Object.entries(groups).map(([group, items]) => (
          <CommandGroup key={group} heading={group}>
            {items.map(item => (
              <CommandItem key={item.path} onSelect={() => handleNavSelect(item.path)} className="cursor-pointer">
                <item.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{item.label}</span>
                <span className="ml-auto text-[9px] text-muted-foreground font-mono">{item.path}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
        <CommandSeparator />
        <CommandGroup heading="Actions">
          {ACTION_ITEMS.map(item => (
            <CommandItem key={item.action} onSelect={() => handleActionSelect(item.action)} className="cursor-pointer">
              <item.icon className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{item.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
