// ═══════════════════════════════════════════════════════════════
// SITA OS — Environment Switcher & Management
// Environment management, backup/restore center
// ═══════════════════════════════════════════════════════════════

import { SitaPageHeader } from "@/components/sita/SitaPageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Globe, CheckCircle, Shield, Download, Upload, Clock, RefreshCw, Plus, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { useDataMode } from "@/contexts/DataModeContext";

interface Environment {
  id: string;
  name: string;
  type: "personal" | "business" | "managed";
  isCurrent: boolean;
  lastAccessed: string;
  backupStatus: "current" | "stale" | "none";
  version: string;
}

const MOCK_ENVIRONMENTS: Environment[] = [
  { id: "env-1", name: "Personal Environment", type: "personal", isCurrent: true, lastAccessed: "2026-04-09T08:30:00Z", backupStatus: "current", version: "v2.8.1" },
  { id: "env-2", name: "Business — Apex Corp", type: "business", isCurrent: false, lastAccessed: "2026-04-08T17:00:00Z", backupStatus: "current", version: "v2.8.1" },
  { id: "env-3", name: "Family Shared", type: "personal", isCurrent: false, lastAccessed: "2026-04-07T20:00:00Z", backupStatus: "stale", version: "v2.7.9" },
];

const BACKUP_OPTIONS = [
  { id: "full", label: "Full Environment Backup", description: "All settings, data, connections, and preferences", icon: Shield },
  { id: "settings", label: "Settings Only", description: "Trust, privacy, advisor, and display preferences", icon: RefreshCw },
  { id: "export", label: "Sovereign Data Export", description: "Export all your data in open formats", icon: Download },
];

const TYPE_STYLES = {
  personal: "bg-primary/10 text-primary",
  business: "bg-[hsl(var(--sita-gold))]/10 text-[hsl(var(--sita-gold))]",
  managed: "bg-muted text-muted-foreground",
};

export default function EnvironmentSwitcher() {
  const { isDemoMode } = useDataMode();

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-6">
      <SitaPageHeader
        icon={<Globe className="h-6 w-6" />}
        title="Environment Manager"
        subtitle="Switch environments, manage backups, and restore from snapshots"
      />
      

      {/* Environments */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold">Your Environments</h2>
        {MOCK_ENVIRONMENTS.map(env => (
          <Card key={env.id} className={cn(env.isCurrent && "ring-1 ring-primary/30")}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Globe className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{env.name}</p>
                      {env.isCurrent && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">Active</span>}
                      <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-medium", TYPE_STYLES[env.type])}>{env.type}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                      <span>{env.version}</span>
                      <span>•</span>
                      <span>Last accessed {new Date(env.lastAccessed).toLocaleDateString()}</span>
                      <span>•</span>
                      <span className={cn(
                        env.backupStatus === "current" ? "text-[hsl(var(--trust-safe))]" :
                        env.backupStatus === "stale" ? "text-[hsl(var(--sita-gold))]" : "text-destructive"
                      )}>
                        Backup: {env.backupStatus}
                      </span>
                    </div>
                  </div>
                </div>
                {!env.isCurrent && (
                  <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors">
                    <ArrowRight className="h-3.5 w-3.5" /> Switch
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        <button className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-primary/30 text-primary text-sm font-medium hover:bg-primary/5 transition-colors">
          <Plus className="h-4 w-4" /> Create New Environment
        </button>
      </div>

      {/* Backup & Restore */}
      <div>
        <h2 className="text-sm font-semibold mb-3">Backup & Restore</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {BACKUP_OPTIONS.map(opt => {
            const Icon = opt.icon;
            return (
              <Card key={opt.id} className="cursor-pointer hover:border-primary/30 transition-colors">
                <CardContent className="p-4 text-center">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-sm font-semibold">{opt.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{opt.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Restore from Backup */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Upload className="h-4 w-4" /> Restore from Backup
          </CardTitle>
          <CardDescription>Restore a previous environment snapshot</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <div className="text-center space-y-2">
              <Upload className="h-8 w-8 mx-auto opacity-40" />
              <p className="text-sm">Drop a backup file or click to browse</p>
              <p className="text-[10px]">Supports .sitabackup and .json formats</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
