// ═══════════════════════════════════════════════════════════════
// SITA OS — Kill-Switch console (Phase 9)
// One-tap emergency stop with reason capture and audit timeline.
// Variants:
//   - "console": full Mission Control surface (button + audit log)
//   - "banner":  passive ambient banner shown when engaged
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AlertTriangle, History, Power, ShieldOff } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useKillSwitch } from "@/platform/runtime/hooks/useKillSwitch";
import {
  engageKillSwitch,
  fetchKillSwitchAudit,
  releaseKillSwitch,
  type KillSwitchAuditRow,
} from "@/lib/autonomy/kill-switch";

const DOMAINS = [
  { value: "__all__", label: "All domains (full halt)" },
  { value: "finance", label: "Finance only" },
  { value: "inbox", label: "Inbox / comms only" },
  { value: "calendar", label: "Calendar only" },
  { value: "ops", label: "Operations only" },
  { value: "marketing", label: "Marketing only" },
];

export function AutonomyKillSwitch({
  variant = "console",
}: {
  variant?: "console" | "banner";
}) {
  const { status, loading } = useKillSwitch();

  if (variant === "banner") {
    if (!status.engaged) return null;
    return (
      <div className="flex items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm">
        <ShieldOff className="h-5 w-5 shrink-0 text-destructive" />
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-destructive">
            Autonomy halted{status.domainScope ? ` (${status.domainScope})` : ""}
          </div>
          <p className="truncate text-xs text-muted-foreground">
            {status.reason || "Owner engaged emergency stop."}
            {status.engagedAt && ` — ${new Date(status.engagedAt).toLocaleString()}`}
          </p>
        </div>
        <ReleaseButton size="sm" />
      </div>
    );
  }

  return (
    <Card className={cn(status.engaged && "border-destructive/60")}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Power
              className={cn(
                "h-4 w-4",
                status.engaged ? "text-destructive" : "text-muted-foreground",
              )}
            />
            Emergency stop
            {status.engaged && (
              <Badge variant="destructive" className="ml-1">
                Engaged
              </Badge>
            )}
          </CardTitle>
          {status.engaged ? (
            <ReleaseButton />
          ) : (
            <EngageDialog disabled={loading} />
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Halts every advisor controller, standing mission, and queued action at
          the next state check. Domain scope optional.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {status.engaged && (
          <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">
                Halted{status.domainScope ? `: ${status.domainScope}` : " globally"}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Reason: {status.reason || "—"}
            </p>
            {status.engagedAt && (
              <p className="text-xs text-muted-foreground">
                Since {new Date(status.engagedAt).toLocaleString()}
              </p>
            )}
          </div>
        )}
        <AuditLog />
      </CardContent>
    </Card>
  );
}

function EngageDialog({ disabled }: { disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [scope, setScope] = useState("__all__");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!reason.trim()) {
      toast.error("Reason is required for the audit log");
      return;
    }
    setBusy(true);
    const res = await engageKillSwitch({
      reason: reason.trim(),
      domainScope: scope === "__all__" ? null : scope,
    });
    setBusy(false);
    if (res.ok) {
      toast.success("Autonomy halted");
      setOpen(false);
      setReason("");
      setScope("__all__");
    } else {
      toast.error(`Could not engage: ${res.error ?? "unknown"}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm" disabled={disabled}>
          <ShieldOff className="mr-2 h-4 w-4" /> Engage
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Halt autonomy</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs">Reason (required)</Label>
            <Input
              autoFocus
              placeholder="e.g. Investigating an unexpected reflection pattern"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Scope</Label>
            <Select value={scope} onValueChange={setScope}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DOMAINS.map((d) => (
                  <SelectItem key={d.value} value={d.value}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="destructive" disabled={busy} onClick={() => void submit()}>
            {busy ? "Engaging…" : "Halt now"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ReleaseButton({ size = "default" }: { size?: "default" | "sm" }) {
  const [busy, setBusy] = useState(false);
  const release = async () => {
    setBusy(true);
    const res = await releaseKillSwitch({ reason: "released_by_owner" });
    setBusy(false);
    if (res.ok) toast.success("Autonomy resumed");
    else toast.error(`Could not release: ${res.error ?? "unknown"}`);
  };
  return (
    <Button variant="outline" size={size} disabled={busy} onClick={() => void release()}>
      <Power className="mr-2 h-4 w-4" /> Resume
    </Button>
  );
}

function AuditLog() {
  const [rows, setRows] = useState<KillSwitchAuditRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const r = await fetchKillSwitchAudit(10);
      if (!cancelled) {
        setRows(r);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <History className="h-3.5 w-3.5" /> Recent halts
      </div>
      {loading ? (
        <div className="text-xs text-muted-foreground">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="rounded border border-dashed border-border/50 p-3 text-center text-xs text-muted-foreground">
          No halts recorded.
        </div>
      ) : (
        <ul className="space-y-1.5">
          {rows.map((r) => (
            <li
              key={r.id}
              className="flex items-start gap-2 rounded border border-border/40 bg-card/30 p-2 text-xs"
            >
              <Badge
                variant={r.action === "engaged" ? "destructive" : "outline"}
                className="text-[10px]"
              >
                {r.action}
              </Badge>
              <div className="min-w-0 flex-1">
                <div className="truncate text-foreground">
                  {r.reason || "—"}
                  {r.domain_scope && (
                    <span className="ml-1 text-muted-foreground">
                      · {r.domain_scope}
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {new Date(r.created_at).toLocaleString()}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}