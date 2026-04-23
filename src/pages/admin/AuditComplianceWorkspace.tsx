// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin: Audit & Compliance Workspace
// Proof chain, mutation lineage, audit logs, export
// ═══════════════════════════════════════════════════════════════

import { SitaPageHeader } from "@/components/sita/SitaPageHeader";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Shield, FileText, Download, Search, Filter, ChevronRight, CheckCircle, AlertTriangle, Clock, User, Workflow, Link2, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
type AuditCategory = "all" | "operator" | "system" | "trust" | "data" | "auth";

interface AuditRecord {
  id: string;
  timestamp: string;
  actor: string;
  actorType: "user" | "system" | "agent";
  action: string;
  category: AuditCategory;
  domain: string;
  severity: "info" | "warning" | "critical";
  proofHash?: string;
  mutationTarget?: string;
  previousValue?: string;
  newValue?: string;
}

const DEMO_AUDIT_RECORDS: AuditRecord[] = [
  { id: "aud-1", timestamp: "2026-04-09T08:30:00Z", actor: "admin@sita.os", actorType: "user", action: "Updated trust threshold", category: "trust", domain: "Trust Center", severity: "warning", proofHash: "a3f8c2d1", mutationTarget: "trust_profile.finance_threshold", previousValue: "70", newValue: "85" },
  { id: "aud-2", timestamp: "2026-04-09T07:15:00Z", actor: "brain-core", actorType: "system", action: "Executed scheduled workflow", category: "system", domain: "Workflows", severity: "info", proofHash: "b7e2f4a9" },
  { id: "aud-3", timestamp: "2026-04-09T06:00:00Z", actor: "ota-agent", actorType: "system", action: "Applied OTA update v2.8.1", category: "system", domain: "Platform", severity: "info", proofHash: "c1d4e8b3" },
  { id: "aud-4", timestamp: "2026-04-08T22:30:00Z", actor: "admin@sita.os", actorType: "user", action: "Approved high-value transfer", category: "trust", domain: "Finance", severity: "critical", proofHash: "d5f9a1c7" },
  { id: "aud-5", timestamp: "2026-04-08T18:00:00Z", actor: "advisor-finance", actorType: "agent", action: "Generated spending forecast", category: "data", domain: "Finance", severity: "info" },
  { id: "aud-6", timestamp: "2026-04-08T14:45:00Z", actor: "admin@sita.os", actorType: "user", action: "Rotated API credentials", category: "auth", domain: "Connectors", severity: "warning", proofHash: "e2b3c4d5" },
  { id: "aud-7", timestamp: "2026-04-08T12:00:00Z", actor: "brain-core", actorType: "system", action: "Connector health check completed", category: "system", domain: "Connectors", severity: "info" },
  { id: "aud-8", timestamp: "2026-04-08T09:30:00Z", actor: "admin@sita.os", actorType: "user", action: "Added team member role", category: "auth", domain: "Identity", severity: "warning", proofHash: "f6g7h8i9" },
];

const CATEGORY_FILTERS: { value: AuditCategory; label: string }[] = [
  { value: "all", label: "All" }, { value: "operator", label: "Operator" },
  { value: "system", label: "System" }, { value: "trust", label: "Trust" },
  { value: "data", label: "Data" }, { value: "auth", label: "Auth" },
];

const SEVERITY_STYLES = {
  info: "text-muted-foreground bg-muted/50",
  warning: "text-[hsl(var(--sita-gold))] bg-[hsl(var(--sita-gold))]/10",
  critical: "text-destructive bg-destructive/10",
};

const ACTOR_ICONS = {
  user: User, system: Workflow, agent: Eye,
};

export default function AuditComplianceWorkspace() {
  const [category, setCategory] = useState<AuditCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = ([] as any[]).filter(r => {
    if (category !== "all" && r.category !== category) return false;
    if (searchQuery && !r.action.toLowerCase().includes(searchQuery.toLowerCase()) && !r.actor.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-6">
      <SitaPageHeader
        icon={<Shield className="h-6 w-6" />}
        title="Audit & Compliance"
        subtitle="Complete audit trail with proof chain, mutation lineage, and evidence export"
      >
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">
          <Download className="h-4 w-4" /> Export Audit Log
        </button>
      </SitaPageHeader>
      

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search audit records..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-border/40 bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex items-center gap-1">
          {CATEGORY_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setCategory(f.value)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                category === f.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Records", value: ([] as any[]).length, color: "text-foreground" },
          { label: "With Proof", value: ([] as any[]).filter(r => r.proofHash).length, color: "text-[hsl(var(--trust-safe))]" },
          { label: "Warnings", value: ([] as any[]).filter(r => r.severity === "warning").length, color: "text-[hsl(var(--sita-gold))]" },
          { label: "Critical", value: ([] as any[]).filter(r => r.severity === "critical").length, color: "text-destructive" },
        ].map(stat => (
          <Card key={stat.label}>
            <CardContent className="p-4 text-center">
              <p className={cn("text-2xl font-bold", stat.color)}>{stat.value}</p>
              <p className="text-[11px] text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Audit Records */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Audit Trail</CardTitle>
          <CardDescription>{filtered.length} records matching filters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          {filtered.map(record => {
            const ActorIcon = ACTOR_ICONS[record.actorType];
            const isExpanded = expandedId === record.id;

            return (
              <div key={record.id}>
                <button
                  onClick={() => setExpandedId(isExpanded ? null : record.id)}
                  className="w-full flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-muted/30 transition-colors text-left"
                >
                  <ActorIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{record.action}</p>
                      <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-medium", SEVERITY_STYLES[record.severity])}>
                        {record.severity}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                      <span>{record.actor}</span>
                      <span>•</span>
                      <span>{record.domain}</span>
                      <span>•</span>
                      <span>{new Date(record.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                  {record.proofHash && <Link2 className="h-3.5 w-3.5 text-[hsl(var(--trust-safe))] shrink-0" />}
                  <ChevronRight className={cn("h-4 w-4 text-muted-foreground transition-transform", isExpanded && "rotate-90")} />
                </button>

                {isExpanded && (
                  <div className="ml-7 mb-2 p-3 rounded-lg bg-muted/20 border border-border/20 space-y-2 text-[11px]">
                    {record.proofHash && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Proof hash:</span>
                        <code className="px-1.5 py-0.5 rounded bg-muted font-mono text-[10px]">{record.proofHash}</code>
                      </div>
                    )}
                    {record.mutationTarget && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Mutation target:</span>
                        <code className="px-1.5 py-0.5 rounded bg-muted font-mono text-[10px]">{record.mutationTarget}</code>
                      </div>
                    )}
                    {record.previousValue && record.newValue && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Changed:</span>
                        <span className="line-through text-destructive/70">{record.previousValue}</span>
                        <span>→</span>
                        <span className="text-[hsl(var(--trust-safe))]">{record.newValue}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
