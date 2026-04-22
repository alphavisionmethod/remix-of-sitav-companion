import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText, CheckCircle, XCircle, RotateCcw, Clock, Shield,
  Monitor, Smartphone, Server, Eye, Download, ChevronDown, ExternalLink
} from "lucide-react";
import { WhyTooltip } from "./WhyTooltip";
import type { CommandOrigin } from "./SurfaceAuthorityMatrix";
import { useDataMode } from "@/contexts/DataModeContext";

interface ControlReceipt {
  id: string;
  action: string;
  target: string;
  targetType: "device" | "service" | "policy" | "account" | "cohort";
  origin: CommandOrigin;
  reason: string;
  result: "success" | "failed" | "partial" | "pending";
  rollbackAvailable: boolean;
  rollbackExpiry?: string;
  timestamp: string;
  auditRef: string;
  actor: string;
}

const ORIGIN_CONFIG: Record<CommandOrigin, { label: string; icon: React.ElementType; color: string }> = {
  os_local: { label: "OS Local", icon: Monitor, color: "text-blue-400" },
  app_remote: { label: "App Remote", icon: Smartphone, color: "text-purple-400" },
  admin_control_plane: { label: "Admin Plane", icon: Server, color: "text-amber-400" },
};

const RESULT_CONFIG: Record<string, { color: string; icon: React.ElementType }> = {
  success: { color: "text-emerald-400", icon: CheckCircle },
  failed: { color: "text-red-400", icon: XCircle },
  partial: { color: "text-amber-400", icon: Clock },
  pending: { color: "text-blue-400", icon: Clock },
};

const DEMO_RECEIPTS: ControlReceipt[] = [
  { id: "cr-1", action: "Remote device lock", target: "desktop-01", targetType: "device", origin: "app_remote", reason: "Suspected unauthorized access detected by trust engine", result: "success", rollbackAvailable: true, rollbackExpiry: "30 days", timestamp: "2026-04-15 14:23:01", auditRef: "AUD-88231", actor: "Founder" },
  { id: "cr-2", action: "Trust threshold update", target: "trust-engine", targetType: "service", origin: "admin_control_plane", reason: "Reducing false positive rate for mobile clients", result: "success", rollbackAvailable: true, rollbackExpiry: "Indefinite", timestamp: "2026-04-15 13:45:22", auditRef: "AUD-88229", actor: "Founder" },
  { id: "cr-3", action: "Canary rollout expansion", target: "release-v3.4.1", targetType: "cohort", origin: "admin_control_plane", reason: "Health metrics stable for 2 hours, expanding to 25%", result: "success", rollbackAvailable: true, rollbackExpiry: "Until next release", timestamp: "2026-04-15 12:10:44", auditRef: "AUD-88225", actor: "Release AI" },
  { id: "cr-4", action: "AI budget cap enforcement", target: "ai-router", targetType: "service", origin: "admin_control_plane", reason: "Monthly spend approaching 80% of allocated budget", result: "success", rollbackAvailable: true, rollbackExpiry: "Indefinite", timestamp: "2026-04-15 11:30:15", auditRef: "AUD-88220", actor: "Cost AI" },
  { id: "cr-5", action: "Emergency sync pause", target: "sync-service", targetType: "service", origin: "app_remote", reason: "Retry storm detected — circuit breaker activated", result: "success", rollbackAvailable: true, rollbackExpiry: "Auto-resume in 30 min", timestamp: "2026-04-15 10:55:02", auditRef: "AUD-88218", actor: "Founder" },
  { id: "cr-6", action: "Session revocation", target: "user-session-x9k2", targetType: "account", origin: "app_remote", reason: "Manual security review — suspicious IP origin", result: "success", rollbackAvailable: false, timestamp: "2026-04-15 09:20:33", auditRef: "AUD-88210", actor: "Founder" },
  { id: "cr-7", action: "Policy activation", target: "pol-42", targetType: "policy", origin: "admin_control_plane", reason: "Council-approved policy for workspace data retention", result: "success", rollbackAvailable: true, rollbackExpiry: "Indefinite", timestamp: "2026-04-14 16:40:11", auditRef: "AUD-88195", actor: "Governance AI" },
  { id: "cr-8", action: "Performance tuning", target: "desktop-01", targetType: "device", origin: "os_local", reason: "Automatic memory optimization during high load", result: "success", rollbackAvailable: true, rollbackExpiry: "Until next reboot", timestamp: "2026-04-14 15:12:00", auditRef: "AUD-88190", actor: "OS Daemon" },
];

export function ControlReceiptsPanel() {
  const { isDemoMode } = useDataMode();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Control Receipts
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">Structured audit trail for every critical admin action</p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
          <Download className="h-3 w-3" /> Export
        </Button>
      </div>

      <div className="space-y-2">
        {(isDemoMode ? DEMO_RECEIPTS : [] as typeof DEMO_RECEIPTS).map((receipt, i) => {
          const ResultIcon = RESULT_CONFIG[receipt.result].icon;
          const OriginIcon = ORIGIN_CONFIG[receipt.origin].icon;
          const isExpanded = expandedId === receipt.id;

          return (
            <motion.div
              key={receipt.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Card
                className={cn(
                  "border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.05] transition-colors cursor-pointer",
                  isExpanded && "ring-1 ring-primary/20"
                )}
                onClick={() => setExpandedId(isExpanded ? null : receipt.id)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <ResultIcon className={cn("h-4 w-4 shrink-0", RESULT_CONFIG[receipt.result].color)} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-foreground">{receipt.action}</span>
                        <Badge variant="outline" className="text-[8px] px-1 py-0">{receipt.targetType}</Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-muted-foreground">→ {receipt.target}</span>
                        <span className="text-[10px] text-muted-foreground/50">·</span>
                        <span className="text-[10px] text-muted-foreground">{receipt.actor}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className={cn("flex items-center gap-1 text-[9px]", ORIGIN_CONFIG[receipt.origin].color)}>
                        <OriginIcon className="h-3 w-3" />
                        <span>{ORIGIN_CONFIG[receipt.origin].label}</span>
                      </div>
                      {receipt.rollbackAvailable && (
                        <Badge variant="outline" className="text-[8px] px-1 py-0 text-emerald-400 border-emerald-500/20">
                          <RotateCcw className="h-2.5 w-2.5 mr-0.5" /> Rollback
                        </Badge>
                      )}
                      <span className="text-[9px] text-muted-foreground">{receipt.timestamp.split(" ")[1]}</span>
                      <ChevronDown className={cn("h-3 w-3 text-muted-foreground transition-transform", isExpanded && "rotate-180")} />
                    </div>
                  </div>

                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      className="mt-3 pt-3 border-t border-white/[0.06] grid grid-cols-2 gap-3 text-[11px]"
                    >
                      <div>
                        <span className="text-muted-foreground">Reason</span>
                        <p className="text-foreground mt-0.5">{receipt.reason}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Result</span>
                        <p className={cn("mt-0.5 font-medium capitalize", RESULT_CONFIG[receipt.result].color)}>{receipt.result}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Rollback</span>
                        <p className="text-foreground mt-0.5">{receipt.rollbackAvailable ? `Available · ${receipt.rollbackExpiry}` : "Not available"}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Audit Reference</span>
                        <p className="text-primary mt-0.5 flex items-center gap-1">{receipt.auditRef} <ExternalLink className="h-2.5 w-2.5" /></p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Timestamp</span>
                        <p className="text-foreground mt-0.5">{receipt.timestamp}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Origin</span>
                        <p className={cn("mt-0.5", ORIGIN_CONFIG[receipt.origin].color)}>{ORIGIN_CONFIG[receipt.origin].label}</p>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
