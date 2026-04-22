// ═══════════════════════════════════════════════════════════════
// SITA OS — Cloud Governance Admin
// Quotas, app governance, trust scoring, compliance, abuse
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  Shield, Gauge, Scale, AlertTriangle, Database, Settings2,
  Globe, Users, Lock, FileCheck, Download, Trash2,
  CheckCircle, XCircle, Clock, BarChart3, Smartphone, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { syncQuotas } from "@/platform/sync-engine/governance/sync-quotas";
import { appGovernance } from "@/platform/sync-engine/governance/app-governance";
import { trustScoring, type TrustState } from "@/platform/sync-engine/governance/trust-scoring";
import { complianceEngine } from "@/platform/sync-engine/governance/compliance-engine";
import { abusePrevention } from "@/platform/sync-engine/operations/abuse-prevention";
import { useDataMode } from "@/contexts/DataModeContext";

const DEMO_TRUST_DEVICES = [
  { id: "d1", name: "MacBook Pro", state: "trusted" as TrustState, score: 92, platform: "macOS" },
  { id: "d2", name: "iPhone 16", state: "managed" as TrustState, score: 71, platform: "iOS" },
  { id: "d3", name: "iPad Air", state: "limited" as TrustState, score: 48, platform: "iPadOS" },
  { id: "d4", name: "Old Laptop", state: "high-risk" as TrustState, score: 15, platform: "Windows" },
  { id: "d5", name: "Guest Tablet", state: "guest" as TrustState, score: 28, platform: "Android" },
];

const TRUST_COLORS: Record<TrustState, string> = {
  trusted: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
  managed: "text-blue-400 bg-blue-400/10 border-blue-400/30",
  limited: "text-amber-400 bg-amber-400/10 border-amber-400/30",
  pending: "text-cyan-400 bg-cyan-400/10 border-cyan-400/30",
  revoked: "text-destructive bg-destructive/10 border-destructive/30",
  "high-risk": "text-red-400 bg-red-400/10 border-red-400/30",
  guest: "text-muted-foreground bg-muted/20 border-border/30",
};

export function CloudGovernanceAdmin() {
  const [section, setSection] = useState<"quotas" | "trust" | "compliance" | "abuse" | "selective">("quotas");
  const governanceReport = appGovernance.getGovernanceReport();
  const abuseStats = abusePrevention.getStats();
  const complianceStats = complianceEngine.getStats();
  const selectiveRules = appGovernance.getSelectiveRules();
  const settingCategories = appGovernance.getSettingCategories();

  const sections = [
    { key: "quotas" as const, label: "Quotas & Storage", icon: Database },
    { key: "trust" as const, label: "Trust Scoring", icon: Shield },
    { key: "compliance" as const, label: "Compliance", icon: FileCheck },
    { key: "abuse" as const, label: "Abuse Prevention", icon: AlertTriangle },
    { key: "selective" as const, label: "Selective Sync", icon: Settings2 },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Apps Governed", value: governanceReport.totalApps || 6, icon: Gauge, color: "text-primary" },
          { label: "Trust Avg", value: `${trustScoring.getStats().averageScore || 51}%`, icon: Shield, color: "text-emerald-400" },
          { label: "Compliance", value: complianceStats.totalConsents || 12, icon: FileCheck, color: "text-blue-400" },
          { label: "Abuse Alerts", value: abuseStats.unresolvedAlerts || 0, icon: AlertTriangle, color: abuseStats.unresolvedAlerts ? "text-amber-400" : "text-emerald-400" },
          { label: "Sync Rules", value: selectiveRules.length, icon: Scale, color: "text-cyan-400" },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="pt-3 pb-2 px-3">
              <div className="flex items-center gap-1.5 mb-0.5">
                <s.icon className={cn("h-3.5 w-3.5", s.color)} />
                <span className="text-[10px] text-muted-foreground">{s.label}</span>
              </div>
              <p className="text-xl font-bold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Section Tabs */}
      <div className="flex gap-1 p-1 bg-muted/30 rounded-lg border border-border/30">
        {sections.map(s => (
          <button
            key={s.key}
            onClick={() => setSection(s.key)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
              section === s.key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <s.icon className="h-3 w-3" />
            <span className="hidden md:inline">{s.label}</span>
          </button>
        ))}
      </div>

      {/* Quotas */}
      {section === "quotas" && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Database className="h-4 w-4 text-primary" /> Storage Quotas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { plan: "Pro", used: 3.2, total: 100, unit: "GB", pct: 3 },
                { plan: "files.documents", used: 1.2, total: 25, unit: "GB", pct: 5 },
                { plan: "files.photos", used: 1.6, total: 50, unit: "GB", pct: 3 },
                { plan: "files.videos", used: 0.3, total: 20, unit: "GB", pct: 2 },
              ].map(q => (
                <div key={q.plan} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium">{q.plan}</span>
                    <span className="text-muted-foreground">{q.used} / {q.total} {q.unit}</span>
                  </div>
                  <Progress value={q.pct} className="h-2" />
                </div>
              ))}
              <div className="flex items-center gap-2 pt-2">
                <Button size="sm" variant="outline" className="text-xs"><Trash2 className="h-3 w-3 mr-1" /> Cleanup</Button>
                <Button size="sm" variant="outline" className="text-xs"><Download className="h-3 w-3 mr-1" /> Export</Button>
              </div>
            </CardContent>
          </Card>

          {/* Plans */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Available Plans</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {syncQuotas.getPlans().map(plan => (
                  <div key={plan.planKey} className={cn(
                    "p-4 rounded-lg border",
                    plan.planKey === "pro" ? "border-primary/50 bg-primary/5" : "border-border/30 bg-muted/10"
                  )}>
                    <p className="text-sm font-semibold">{plan.displayName}</p>
                    <p className="text-2xl font-bold mt-1">{plan.priceCents === 0 ? "Free" : `$${(plan.priceCents / 100).toFixed(2)}`}<span className="text-xs text-muted-foreground font-normal">/mo</span></p>
                    <p className="text-xs text-muted-foreground mt-1">{syncQuotas.formatBytes(plan.totalBytes)} · {plan.maxDevices} devices</p>
                    {plan.planKey === "pro" && <Badge className="mt-2 text-xs">Current Plan</Badge>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Trust Scoring */}
      {section === "trust" && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" /> Device Trust Scores
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(isDemoMode ? DEMO_TRUST_DEVICES : [] as typeof DEMO_TRUST_DEVICES).map(d => (
              <div key={d.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/30">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-muted/30 flex items-center justify-center">
                    <Smartphone className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{d.name}</p>
                    <p className="text-xs text-muted-foreground">{d.platform}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-20">
                    <Progress value={d.score} className="h-2" />
                    <p className="text-[10px] text-muted-foreground text-right mt-0.5">{d.score}/100</p>
                  </div>
                  <Badge variant="outline" className={cn("text-xs capitalize min-w-[72px] justify-center", TRUST_COLORS[d.state])}>
                    {d.state}
                  </Badge>
                </div>
              </div>
            ))}
            <p className="text-xs text-muted-foreground text-center pt-2">
              Trust scores evaluate enrollment age, auth method, OS security, behavior patterns, and compliance
            </p>
          </CardContent>
        </Card>
      )}

      {/* Compliance */}
      {section === "compliance" && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" /> Regional Policies
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {complianceEngine.getAllRegions().map(r => (
                <div key={r.regionCode} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/30">
                  <div>
                    <p className="text-sm font-medium">{r.displayName}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.dataResidency} residency · {r.retentionMaxDays}d retention
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {r.rightToErasure && <Badge variant="outline" className="text-xs text-emerald-400 border-emerald-400/30">Erasure</Badge>}
                    {r.encryptionMandatory && <Badge variant="outline" className="text-xs text-blue-400 border-blue-400/30">Encryption</Badge>}
                    {r.consentRequired && <Badge variant="outline" className="text-xs text-amber-400 border-amber-400/30">Consent</Badge>}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" /> Multi-Account & Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                <div className="flex items-center gap-2">
                  <Download className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Data Export</p>
                    <p className="text-xs text-muted-foreground">Download all your synced data</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="text-xs">Request Export</Button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                <div className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4 text-destructive" />
                  <div>
                    <p className="text-sm font-medium">Account Deletion</p>
                    <p className="text-xs text-muted-foreground">30-day grace period with full erasure</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="text-xs text-destructive">Request Deletion</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Abuse Prevention */}
      {section === "abuse" && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" /> Abuse Prevention Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Blocked Devices", value: abuseStats.blockedDevices, color: "text-destructive" },
                { label: "Paused Propagation", value: abuseStats.pausedPropagation, color: "text-amber-400" },
                { label: "Active Limits", value: abuseStats.activeLimits, color: "text-blue-400" },
                { label: "Unresolved", value: abuseStats.unresolvedAlerts, color: abuseStats.unresolvedAlerts ? "text-red-400" : "text-emerald-400" },
              ].map(s => (
                <div key={s.label} className="p-3 rounded-lg bg-muted/20 border border-border/30 text-center">
                  <p className={cn("text-xl font-bold", s.color)}>{s.value}</p>
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Protection Features</p>
              {[
                { name: "Rate Limiting", desc: "Per-device action throttling", active: true },
                { name: "Mass Change Detection", desc: "Ransomware-like bulk operation guard", active: true },
                { name: "Suspicious Login Detection", desc: "Location, time, device switch anomalies", active: true },
                { name: "Large Deletion Guard", desc: "Pause propagation on mass deletes", active: true },
                { name: "Token Misuse Detection", desc: "Detect compromised auth tokens", active: true },
              ].map(f => (
                <div key={f.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/30">
                  <div>
                    <p className="text-sm font-medium">{f.name}</p>
                    <p className="text-xs text-muted-foreground">{f.desc}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs text-emerald-400">Active</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selective Sync Policy Matrix */}
      {section === "selective" && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Scale className="h-4 w-4 text-primary" /> Selective Sync Rules
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {selectiveRules.map(rule => (
                <div key={rule.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/30">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{rule.description}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      <Badge variant="outline" className="text-xs">{rule.namespace}</Badge>
                      <Badge variant="outline" className="text-xs">{rule.deviceClass}</Badge>
                      <Badge variant="outline" className="text-xs">{rule.networkType}</Badge>
                      {rule.batteryMin > 0 && <Badge variant="outline" className="text-xs">≥{rule.batteryMin}% battery</Badge>}
                    </div>
                  </div>
                  <Switch checked={rule.enabled} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-primary" /> Settings Sync Categories
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {settingCategories.map(cat => (
                <div key={cat.key} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/30">
                  <div>
                    <p className="text-sm font-medium">{cat.label}</p>
                    <p className="text-xs text-muted-foreground">{cat.examples.join(", ")}</p>
                  </div>
                  <Badge variant="outline" className={cn("text-xs capitalize", {
                    "text-emerald-400 border-emerald-400/30": cat.syncMode === "always-sync",
                    "text-amber-400 border-amber-400/30": cat.syncMode === "ask-user",
                    "text-muted-foreground": cat.syncMode === "device-specific",
                    "text-blue-400 border-blue-400/30": cat.syncMode === "encrypted-only",
                    "text-purple-400 border-purple-400/30": cat.syncMode === "work-only",
                  })}>
                    {cat.syncMode.replace(/-/g, " ")}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
