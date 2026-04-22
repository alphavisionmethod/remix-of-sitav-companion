import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import {
import { useDataMode } from "@/contexts/DataModeContext";
  Monitor, Shield, Clock, CheckCircle, AlertTriangle, Terminal,
  XCircle, Lock, Eye, Radio, ArrowRight
} from "lucide-react";

interface RemoteCommand {
  id: string;
  command: string;
  status: "pending" | "executed" | "failed" | "approved";
  timestamp: string;
  requiresApproval: boolean;
  approved?: boolean;
}

interface RemoteSession {
  id: string;
  targetDevice: string;
  targetType: "desktop" | "mobile" | "tablet" | "server";
  trustLevel: "full" | "limited" | "untrusted";
  startedAt: string;
  expiresAt: string;
  commands: RemoteCommand[];
  isActive: boolean;
}

const DEMO_SESSION: RemoteSession = {
  id: "rs-001",
  targetDevice: "desktop-01 (MacBook Pro)",
  targetType: "desktop",
  trustLevel: "full",
  startedAt: "14:10:00",
  expiresAt: "15:10:00",
  isActive: true,
  commands: [
    { id: "cmd-1", command: "Query device health metrics", status: "executed", timestamp: "14:12:33", requiresApproval: false },
    { id: "cmd-2", command: "Inspect sync queue depth", status: "executed", timestamp: "14:14:01", requiresApproval: false },
    { id: "cmd-3", command: "Flush local cache (non-destructive)", status: "executed", timestamp: "14:18:44", requiresApproval: true, approved: true },
    { id: "cmd-4", command: "Restart sync daemon", status: "approved", timestamp: "14:22:10", requiresApproval: true, approved: true },
    { id: "cmd-5", command: "Apply performance tuning profile", status: "pending", timestamp: "14:23:01", requiresApproval: true },
  ],
};

const TRUST_COLORS: Record<string, string> = {
  full: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10",
  limited: "text-amber-400 border-amber-500/20 bg-amber-500/10",
  untrusted: "text-red-400 border-red-500/20 bg-red-500/10",
};

const CMD_STATUS_ICON: Record<string, { icon: React.ElementType; color: string }> = {
  pending: { icon: Clock, color: "text-blue-400" },
  executed: { icon: CheckCircle, color: "text-emerald-400" },
  failed: { icon: XCircle, color: "text-red-400" },
  approved: { icon: Shield, color: "text-amber-400" },
};

export function RemoteAuthoritySession({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const session = DEMO_SESSION;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[480px] sm:max-w-[480px] bg-card/95 backdrop-blur-2xl border-border/30 overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2 text-foreground">
            <Terminal className="h-5 w-5 text-primary" />
            Remote Authority Session
          </SheetTitle>
          <SheetDescription className="text-xs">
            Tracked command session with full audit trail
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4">
          {/* Session Info */}
          <Card className="border-white/[0.06] bg-white/[0.03]">
            <CardContent className="p-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Monitor className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">{session.targetDevice}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {session.isActive && <Radio className="h-3 w-3 text-emerald-400 animate-pulse" />}
                  <Badge variant="outline" className={cn("text-[9px]", TRUST_COLORS[session.trustLevel])}>
                    Trust: {session.trustLevel}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-[10px]">
                <div className="p-2 rounded bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-muted-foreground">Started</span>
                  <p className="text-foreground font-medium mt-0.5">{session.startedAt}</p>
                </div>
                <div className="p-2 rounded bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-muted-foreground">Expires</span>
                  <p className="text-foreground font-medium mt-0.5">{session.expiresAt}</p>
                </div>
                <div className="p-2 rounded bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-muted-foreground">Commands</span>
                  <p className="text-foreground font-medium mt-0.5">{session.commands.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Command Log */}
          <div>
            <h3 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
              <Terminal className="h-3.5 w-3.5 text-muted-foreground" />
              Command History
            </h3>
            <div className="space-y-1.5">
              {session.commands.map((cmd, i) => {
                const StatusInfo = CMD_STATUS_ICON[cmd.status];
                return (
                  <motion.div
                    key={cmd.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="p-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      <StatusInfo.icon className={cn("h-3.5 w-3.5 mt-0.5 shrink-0", StatusInfo.color)} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-foreground">{cmd.command}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] text-muted-foreground">{cmd.timestamp}</span>
                          {cmd.requiresApproval && (
                            <Badge variant="outline" className={cn("text-[8px] px-1 py-0",
                              cmd.approved ? "text-emerald-400 border-emerald-500/20" :
                              cmd.status === "pending" ? "text-amber-400 border-amber-500/20" : ""
                            )}>
                              {cmd.approved ? "Approved" : cmd.status === "pending" ? "Awaiting approval" : "Required approval"}
                            </Badge>
                          )}
                          <Badge variant="outline" className={cn("text-[8px] px-1 py-0 capitalize", StatusInfo.color)}>
                            {cmd.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Session Actions */}
          <div className="flex items-center gap-2 pt-2">
            <Button variant="outline" size="sm" className="flex-1 text-xs gap-1.5">
              <Lock className="h-3 w-3" /> End Session
            </Button>
            <Button variant="outline" size="sm" className="flex-1 text-xs gap-1.5">
              <Eye className="h-3 w-3" /> View Audit Trail
            </Button>
          </div>

          {/* Security Notice */}
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 flex items-start gap-2">
            <Shield className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
            <p className="text-[10px] text-foreground/80 leading-relaxed">
              This session is tracked end-to-end. Every command is logged with timestamp, approval status,
              and execution result. The audit trail is immutable and available in Control Receipts.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
