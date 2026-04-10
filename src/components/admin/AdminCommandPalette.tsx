import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator
} from "@/components/ui/command";
import {
  Activity, AlertTriangle, Brain, Crown, Database, Eye, GitBranch, Globe,
  Layers, Link2, Lock, Rocket, Server, Shield, Target, TrendingUp, Zap,
  BarChart3, Cpu, FileText, Play, RefreshCw, Settings, Search
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

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          {NAV_ITEMS.map(item => (
            <CommandItem key={item.path} onSelect={() => handleNavSelect(item.path)} className="cursor-pointer">
              <item.icon className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{item.label}</span>
              <span className="ml-auto text-[9px] text-muted-foreground font-mono">{item.path}</span>
            </CommandItem>
          ))}
        </CommandGroup>
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
