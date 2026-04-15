// ═══════════════════════════════════════════════════════════════
// SITA OS — User Support Escalation
// Self-service support: try self-repair → create case → track status
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supportWorkflow, type SupportCase, type CaseCategory } from "@/lib/platform-plane";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  LifeBuoy, Wrench, RefreshCw, CheckCircle2, AlertCircle,
  ArrowUpRight, Clock, Send, Zap, Shield, HardDrive, Smartphone
} from "lucide-react";

const SELF_REPAIR_ACTIONS = [
  { id: "sync", label: "Reconnect Sync", icon: RefreshCw, description: "Reset sync connection and retry" },
  { id: "cache", label: "Rebuild Local Cache", icon: HardDrive, description: "Clear and rebuild local data cache" },
  { id: "auth", label: "Re-authenticate", icon: Shield, description: "Refresh your authentication session" },
  { id: "device", label: "Re-enroll Device", icon: Smartphone, description: "Re-register this device with the platform" },
];

const STATUS_STYLES: Record<string, { color: string; icon: typeof CheckCircle2 }> = {
  open: { color: "bg-primary/20 text-primary", icon: AlertCircle },
  investigating: { color: "bg-amber-500/20 text-amber-400", icon: Clock },
  escalated: { color: "bg-destructive/20 text-destructive", icon: ArrowUpRight },
  resolved: { color: "bg-green-500/20 text-green-400", icon: CheckCircle2 },
  closed: { color: "bg-muted text-muted-foreground", icon: CheckCircle2 },
};

export function UserSupportEscalation() {
  const { user } = useAuth();
  const [cases, setCases] = useState<SupportCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [repairRunning, setRepairRunning] = useState<string | null>(null);
  const [repairResults, setRepairResults] = useState<Record<string, string>>({});
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCategory, setNewCategory] = useState<CaseCategory>("general");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!user) return;
    supportWorkflow.getUserCases(user.id).then((c) => {
      setCases(c);
      setLoading(false);
    });
  }, [user]);

  const runSelfRepair = async (actionId: string) => {
    setRepairRunning(actionId);
    // Simulate self-repair attempt
    await new Promise((r) => setTimeout(r, 1500 + Math.random() * 1000));
    const success = Math.random() > 0.4;
    setRepairResults((prev) => ({
      ...prev,
      [actionId]: success ? "success" : "failed",
    }));
    setRepairRunning(null);
    if (success) {
      toast.success("Self-repair completed successfully");
    } else {
      toast.error("Self-repair could not resolve the issue — consider opening a support case");
    }
  };

  const createCase = async () => {
    if (!user || !newTitle.trim()) return;
    setCreating(true);
    try {
      const selfRepairAttempted = Object.keys(repairResults).length > 0;
      const selfRepairResult = selfRepairAttempted
        ? Object.entries(repairResults).map(([k, v]) => `${k}: ${v}`).join(", ")
        : undefined;

      const newCase = await supportWorkflow.createCase(
        user.id, newTitle.trim(), newDescription.trim(),
        newCategory, "normal", selfRepairAttempted, selfRepairResult
      );
      setCases((prev) => [newCase, ...prev]);
      setShowCreateForm(false);
      setNewTitle("");
      setNewDescription("");
      toast.success("Support case created — we'll look into it");
    } catch (err) {
      toast.error("Failed to create case");
    } finally {
      setCreating(false);
    }
  };

  const openCases = cases.filter((c) => !["resolved", "closed"].includes(c.status));

  return (
    <div className="space-y-6">
      {/* Self-Repair Tools */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            Quick Fix Tools
          </CardTitle>
          <CardDescription>Try these first before opening a support case</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SELF_REPAIR_ACTIONS.map((action) => {
              const Icon = action.icon;
              const result = repairResults[action.id];
              const isRunning = repairRunning === action.id;
              return (
                <button
                  key={action.id}
                  onClick={() => runSelfRepair(action.id)}
                  disabled={isRunning || result === "success"}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-all text-left disabled:opacity-50 group"
                >
                  <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                    {isRunning ? (
                      <RefreshCw className="h-4 w-4 text-primary animate-spin" />
                    ) : result === "success" ? (
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                    ) : result === "failed" ? (
                      <AlertCircle className="h-4 w-4 text-destructive" />
                    ) : (
                      <Icon className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-foreground">{action.label}</div>
                    <div className="text-[11px] text-muted-foreground">{action.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Open Cases */}
      {openCases.length > 0 && (
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <LifeBuoy className="h-4 w-4 text-primary" />
              Your Open Cases
              <Badge variant="outline" className="ml-auto">{openCases.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {openCases.map((c) => {
              const statusInfo = STATUS_STYLES[c.status] ?? STATUS_STYLES.open;
              const StatusIcon = statusInfo.icon;
              return (
                <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-border/30">
                  <StatusIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{c.title}</div>
                    <div className="text-[10px] text-muted-foreground font-mono">{c.correlationId ?? c.id.slice(0, 8)}</div>
                  </div>
                  <Badge className={`text-[10px] shrink-0 ${statusInfo.color}`}>{c.status}</Badge>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Create Case */}
      {showCreateForm ? (
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">New Support Case</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Brief title describing the issue"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <Textarea
              placeholder="Describe what happened and what you expected…"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              rows={3}
            />
            <Select value={newCategory} onValueChange={(v) => setNewCategory(v as CaseCategory)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sync">Sync Issue</SelectItem>
                <SelectItem value="storage">Storage Issue</SelectItem>
                <SelectItem value="device">Device Issue</SelectItem>
                <SelectItem value="account">Account Issue</SelectItem>
                <SelectItem value="security">Security Concern</SelectItem>
                <SelectItem value="billing">Billing</SelectItem>
                <SelectItem value="general">General</SelectItem>
              </SelectContent>
            </Select>
            {Object.keys(repairResults).length > 0 && (
              <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
                Self-repair attempts will be included: {Object.entries(repairResults).map(([k, v]) => `${k} (${v})`).join(", ")}
              </div>
            )}
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={() => setShowCreateForm(false)}>Cancel</Button>
              <Button size="sm" onClick={createCase} disabled={creating || !newTitle.trim()}>
                <Send className="h-3.5 w-3.5 mr-1" />
                {creating ? "Creating…" : "Submit Case"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button variant="outline" className="w-full" onClick={() => setShowCreateForm(true)}>
          <LifeBuoy className="h-4 w-4 mr-2" />
          Open a Support Case
        </Button>
      )}
    </div>
  );
}
