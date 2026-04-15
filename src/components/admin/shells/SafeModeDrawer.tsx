import { useSafeMode } from "./SafeModeProvider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  ShieldCheck, Cloud, HardDrive, Rocket, Shield, Brain,
  Smartphone, Lock, RotateCcw, Info
} from "lucide-react";
import { cn } from "@/lib/utils";

const DOMAIN_META: Record<string, { label: string; icon: React.ElementType; description: string }> = {
  sync: { label: "Sync", icon: Cloud, description: "Pause all sync-related mutations and repairs" },
  storage: { label: "Storage", icon: HardDrive, description: "Block storage lifecycle and migration actions" },
  releases: { label: "Releases", icon: Rocket, description: "Freeze rollouts, ring promotions, and deploys" },
  trust: { label: "Trust & Security", icon: Shield, description: "Hold trust threshold changes and policy updates" },
  ai: { label: "AI Operations", icon: Brain, description: "Pause AI model routing changes and budget adjustments" },
  devices: { label: "Devices", icon: Smartphone, description: "Block device cohort actions and fleet changes" },
};

export function SafeModeDrawer({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const {
    enabled, domainPauses, approvalOnlyMode, automationHold,
    toggleSafeMode, toggleDomain, toggleApprovalOnly, toggleAutomationHold, resetSafeMode,
  } = useSafeMode();

  const pausedDomainCount = Object.values(domainPauses).filter(Boolean).length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:max-w-[400px] bg-card/95 backdrop-blur-2xl border-border/30 overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2 text-foreground">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Safe Mode Configuration
          </SheetTitle>
          <SheetDescription className="text-xs">
            Control platform safety guarantees. Safe Mode ensures all actions are sandboxed, canary-first, and reversible.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          {/* Master Toggle */}
          <div className={cn(
            "p-4 rounded-xl border transition-colors",
            enabled ? "bg-emerald-500/5 border-emerald-500/20" : "bg-muted/5 border-border/20"
          )}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-lg", enabled ? "bg-emerald-500/10" : "bg-muted/20")}>
                  <ShieldCheck className={cn("h-5 w-5", enabled ? "text-emerald-400" : "text-muted-foreground")} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Global Safe Mode</p>
                  <p className="text-[10px] text-muted-foreground">Sandbox-first execution for all operations</p>
                </div>
              </div>
              <Switch checked={enabled} onCheckedChange={toggleSafeMode} />
            </div>
            {enabled && (
              <div className="mt-3 p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                <div className="flex items-start gap-2">
                  <Info className="h-3 w-3 text-emerald-400 mt-0.5 shrink-0" />
                  <p className="text-[10px] text-emerald-300/80 leading-relaxed">
                    All operations will simulate before execution. Destructive actions are blocked. Canary-only rollouts are enforced. Automatic rollback is armed.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Per-Domain Pauses */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-foreground">Domain-Level Pauses</h3>
              {pausedDomainCount > 0 && (
                <Badge variant="outline" className="text-[9px] text-amber-400 border-amber-500/20">
                  {pausedDomainCount} paused
                </Badge>
              )}
            </div>
            <div className="space-y-2">
              {Object.entries(DOMAIN_META).map(([key, meta]) => {
                const domainKey = key as keyof typeof domainPauses;
                const paused = domainPauses[domainKey];
                return (
                  <div
                    key={key}
                    className={cn(
                      "p-3 rounded-lg border transition-colors",
                      paused ? "bg-amber-500/5 border-amber-500/15" : "bg-white/[0.02] border-white/[0.06]"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <meta.icon className={cn("h-3.5 w-3.5", paused ? "text-amber-400" : "text-muted-foreground")} />
                        <div>
                          <p className="text-xs font-medium text-foreground">{meta.label}</p>
                          <p className="text-[9px] text-muted-foreground">{meta.description}</p>
                        </div>
                      </div>
                      <Switch checked={paused} onCheckedChange={() => toggleDomain(domainKey)} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Additional Controls */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-foreground">Additional Controls</h3>

            <div className="p-3 rounded-lg border bg-white/[0.02] border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Lock className={cn("h-3.5 w-3.5", approvalOnlyMode ? "text-primary" : "text-muted-foreground")} />
                <div>
                  <p className="text-xs font-medium text-foreground">Approval-Only Mode</p>
                  <p className="text-[9px] text-muted-foreground">All actions require explicit human approval</p>
                </div>
              </div>
              <Switch checked={approvalOnlyMode} onCheckedChange={toggleApprovalOnly} />
            </div>

            <div className="p-3 rounded-lg border bg-white/[0.02] border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Lock className={cn("h-3.5 w-3.5", automationHold ? "text-primary" : "text-muted-foreground")} />
                <div>
                  <p className="text-xs font-medium text-foreground">Automation Hold</p>
                  <p className="text-[9px] text-muted-foreground">Pause all background automation and self-healing</p>
                </div>
              </div>
              <Switch checked={automationHold} onCheckedChange={toggleAutomationHold} />
            </div>
          </div>

          {/* Reset */}
          <Button variant="outline" size="sm" className="w-full gap-2 text-xs" onClick={resetSafeMode}>
            <RotateCcw className="h-3 w-3" /> Reset All Safe Mode Settings
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
