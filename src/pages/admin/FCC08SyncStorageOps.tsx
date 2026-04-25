// ═══════════════════════════════════════════════════════════════
// SITA OS — Sync & Storage Ops Board (FCC08)
// Queue health, conflicts, upload failures, repair tools
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { motion } from "framer-motion";
import { AdminPageHeader } from "@/platform/sita/components/sita/admin/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  RefreshCw, HardDrive, AlertTriangle, CheckCircle2, Clock, Zap,
  Upload, Download, FileWarning, Wrench, Activity, BarChart3,
  Shield, Server, XCircle, ArrowUpDown, Database
} from "lucide-react";

interface QueueMetric {
  label: string;
  value: number;
  unit: string;
  status: "healthy" | "warning" | "critical";
  icon: React.ElementType;
}

const QUEUE_METRICS: QueueMetric[] = [
  { label: "Upload Queue", value: 23, unit: "pending", status: "healthy", icon: Upload },
  { label: "Download Queue", value: 8, unit: "pending", status: "healthy", icon: Download },
  { label: "Sync Backlog", value: 147, unit: "items", status: "warning", icon: ArrowUpDown },
  { label: "Active Conflicts", value: 3, unit: "unresolved", status: "warning", icon: FileWarning },
  { label: "Failed Uploads (24h)", value: 12, unit: "failures", status: "warning", icon: XCircle },
  { label: "Storage Health", value: 99.2, unit: "%", status: "healthy", icon: HardDrive },
];

const RECENT_CONFLICTS = [
  { id: "c1", file: "quarterly-report-v3.xlsx", type: "concurrent_edit", user1: "user@example.com", user2: "admin@example.com", detected: "2h ago", resolved: false },
  { id: "c2", file: "team-roadmap.md", type: "version_divergence", user1: "user@example.com", user2: "sync-agent", detected: "5h ago", resolved: false },
  { id: "c3", file: "budget-2026.xlsx", type: "concurrent_edit", user1: "finance@example.com", user2: "user@example.com", detected: "1d ago", resolved: true },
];

const UPLOAD_FAILURES = [
  { id: "f1", file: "presentation.pptx", size: "12.4 MB", error: "Upload finalization timeout", retries: 3, device: "MacBook Pro", time: "45m ago" },
  { id: "f2", file: "video-demo.mp4", size: "248 MB", error: "Chunk upload interrupted (network)", retries: 2, device: "iPhone 15", time: "1h ago" },
  { id: "f3", file: "design-assets.zip", size: "67 MB", error: "Storage quota temporarily exceeded", retries: 1, device: "iPad Pro", time: "2h ago" },
  { id: "f4", file: "database-export.csv", size: "4.2 MB", error: "Checksum mismatch after transfer", retries: 2, device: "Windows Desktop", time: "3h ago" },
];

const REPAIR_TOOLS = [
  { id: "r1", name: "Force Sync Queue Drain", description: "Clear stale entries and restart workers", risk: "medium", autoHeal: true, lastRun: "2d ago", successRate: "94%" },
  { id: "r2", name: "Conflict Auto-Resolver", description: "Apply latest-write-wins to unresolved conflicts", risk: "medium", autoHeal: false, lastRun: "5d ago", successRate: "87%" },
  { id: "r3", name: "Upload Retry Storm Breaker", description: "Pause and re-schedule failed uploads with backoff", risk: "low", autoHeal: true, lastRun: "1d ago", successRate: "98%" },
  { id: "r4", name: "Storage Integrity Scan", description: "Verify checksums for all objects in user buckets", risk: "low", autoHeal: false, lastRun: "3d ago", successRate: "100%" },
  { id: "r5", name: "Orphaned Object Cleanup", description: "Find and clean up storage objects with no metadata references", risk: "high", autoHeal: false, lastRun: "7d ago", successRate: "91%" },
  { id: "r6", name: "Device Sync State Reset", description: "Force full re-sync for a specific device", risk: "medium", autoHeal: false, lastRun: "1d ago", successRate: "96%" },
];

const STATUS_COLORS = {
  healthy: "text-trust-safe",
  warning: "text-sita-gold",
  critical: "text-destructive",
};

export default function FCC08SyncStorageOps() {
  const { toast } = useToast();

  function handleRunTool(tool: typeof REPAIR_TOOLS[0]) {
    toast({ title: "Repair Tool Launched", description: `${tool.name} started. Monitoring in progress...` });
  }

  return (
    <div className="space-y-6 p-6">
      <AdminPageHeader
        icon={RefreshCw}
        title="Sync & Storage Operations"
        subtitle="Queue health, conflict resolution, upload failures, and repair tools"
        accent="trust"
      >
        <Button size="sm" variant="outline" className="gap-1.5">
          <Wrench className="h-3.5 w-3.5" /> Run Diagnostics
        </Button>
      </AdminPageHeader>

      {/* Queue Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {QUEUE_METRICS.map((m, i) => {
          const Icon = m.icon;
          return (
            <motion.div key={m.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Card className="border-white/10 bg-white/[0.03]">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-1">
                    <Icon className={`h-4 w-4 ${STATUS_COLORS[m.status]}`} />
                    <div className={`h-2 w-2 rounded-full ${m.status === "healthy" ? "bg-trust-safe" : m.status === "warning" ? "bg-sita-gold" : "bg-destructive"}`} />
                  </div>
                  <p className="text-xl font-bold font-display">{m.value}{m.unit === "%" ? "%" : ""}</p>
                  <p className="text-[10px] text-muted-foreground">{m.label}</p>
                  {m.unit !== "%" && <p className="text-[9px] text-muted-foreground">{m.unit}</p>}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <Tabs defaultValue="conflicts" className="space-y-4">
        <TabsList className="bg-white/[0.03] border border-white/10">
          <TabsTrigger value="conflicts">Conflicts</TabsTrigger>
          <TabsTrigger value="failures">Upload Failures</TabsTrigger>
          <TabsTrigger value="repair">Repair Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="conflicts" className="space-y-3">
          {RECENT_CONFLICTS.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
              <Card className="border-white/10 bg-white/[0.02]">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <FileWarning className={`h-5 w-5 mt-0.5 shrink-0 ${c.resolved ? "text-trust-safe" : "text-sita-gold"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium font-mono">{c.file}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-[9px]">{c.type.replace("_", " ")}</Badge>
                        <span className="text-[10px] text-muted-foreground">{c.user1} ↔ {c.user2}</span>
                        <span className="text-[10px] text-muted-foreground ml-auto">{c.detected}</span>
                      </div>
                    </div>
                    {c.resolved ? (
                      <Badge variant="outline" className="text-[9px] text-trust-safe border-trust-safe/20">Resolved</Badge>
                    ) : (
                      <div className="flex gap-1.5">
                        <Button size="sm" variant="outline" className="h-7 text-[10px]">Keep Latest</Button>
                        <Button size="sm" variant="outline" className="h-7 text-[10px]">Keep Both</Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        <TabsContent value="failures" className="space-y-3">
          {UPLOAD_FAILURES.map((f, i) => (
            <motion.div key={f.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
              <Card className="border-white/10 bg-white/[0.02]">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <XCircle className="h-5 w-5 mt-0.5 text-destructive shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium font-mono">{f.file}</p>
                        <span className="text-[10px] text-muted-foreground">{f.size}</span>
                      </div>
                      <p className="text-xs text-destructive/80 mt-0.5">{f.error}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                        <span>Device: {f.device}</span>
                        <span>Retries: {f.retries}</span>
                        <span>{f.time}</span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1 shrink-0">
                      <RefreshCw className="h-3 w-3" /> Retry
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        <TabsContent value="repair" className="space-y-3">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {REPAIR_TOOLS.map((tool, i) => (
              <motion.div key={tool.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Card className="border-white/10 bg-white/[0.02]">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-white/[0.05]">
                        <Wrench className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{tool.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{tool.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className={`text-[9px] ${tool.risk === "high" ? "text-destructive" : tool.risk === "medium" ? "text-sita-gold" : "text-trust-safe"}`}>
                            Risk: {tool.risk}
                          </Badge>
                          {tool.autoHeal && (
                            <Badge variant="outline" className="text-[9px] text-trust-safe border-trust-safe/20">Auto-heal</Badge>
                          )}
                          <span className="text-[10px] text-muted-foreground">Success: {tool.successRate}</span>
                          <span className="text-[10px] text-muted-foreground">Last: {tool.lastRun}</span>
                        </div>
                      </div>
                      <Button size="sm" className="gap-1 shrink-0" onClick={() => handleRunTool(tool)}>
                        <Zap className="h-3.5 w-3.5" /> Run
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
