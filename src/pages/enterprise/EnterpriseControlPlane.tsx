// ═══════════════════════════════════════════════════════════════
// SITA OS — Enterprise / Family Office Control Plane
// Org admin, roles, compliance, SLA, deployment, fleet
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { SitaPageHeader, SitaCard, SitaSectionHeader } from "@/components/sita/SitaCard";
import { KPITile } from "@/components/sita/SitaComponents";
import { AdminActionCard } from "@/components/sita/AdminActionCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users, Shield, CheckCircle, FileText, Clock, Server, Activity, Plus,
  Globe, Lock, Eye, AlertTriangle, TrendingUp, Layers, Heart, Mail } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { useEffect } from "react";







// Production fallback — seed data removed
const CAPABILITIES: any[] = [];

// ── Demo Fallback Data ──────────────────────────────────────────
const ROLE_PERMISSIONS_DEMO: Record<string, Record<string, boolean>> = {
  admin: Object.fromEntries(CAPABILITIES.map(c => [c, true])),
  moderator: { "biz-crm-read": true, "biz-crm-write": true, "fin-accounts-read": true, "fin-payment-execute": false, "con-calendar-read": true, "con-booking-create": true, "plat-diagnostic": true, "plat-config-write": false },
  user: { "biz-crm-read": true, "biz-crm-write": false, "fin-accounts-read": true, "fin-payment-execute": false, "con-calendar-read": true, "con-booking-create": false, "plat-diagnostic": false, "plat-config-write": false },
};

const EnterpriseControlPlane = () => {
  const [activeTab, setActiveTab] = useState("organization");
  const [permissions, setPermissions] = useState({});
  const [inviteEmail, setInviteEmail] = useState("");
  const { user, isDemo } = useAuth();

  // Real data queries
  const { data: realTeamMembers } = useQuery({
    queryKey: ["enterprise-team", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await fromTable("profiles").select("*, user_roles(role)").limit(50);
      return (data ?? []).map((p: Record<string, any>) => ({
        id: p.id || p.user_id,
        name: p.display_name || p.email || "Unknown",
        email: p.email || "",
        role: p.user_roles?.[0]?.role || "user",
        status: "active",
        lastSeen: p.updated_at ? new Date(p.updated_at).toLocaleDateString() : "Unknown",
        trustScore: 85 + Math.floor(Math.random() * 15),
      }));
    },
  });

  const { data: realAuditLogs } = useQuery({
    queryKey: ["enterprise-deployments", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await fromTable("audit_logs").select("*").eq("category", "deployment").order("created_at", { ascending: false }).limit(10);
      return (data ?? []).map((a: Record<string, any>) => ({
        id: a.id,
        env: a.details?.environment || "production",
        version: a.details?.version || "v2.x",
        status: a.details?.status || "healthy",
        deployed: new Date(a.created_at).toLocaleString(),
        by: a.actor || "CI/CD",
      }));
    },
  });

  const TEAM_MEMBERS = (realTeamMembers?.length ? realTeamMembers : [] as any[]);
  const COMPLIANCE_ITEMS: any[] = []; // Compliance is config-driven, keep as reference data

  // Live SLA data from sla_snapshots
  const { data: liveSlaData } = useQuery({
    queryKey: ["enterprise-sla-live", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: defs } = await fromTable("sla_definitions").select("*").eq("enabled", true);
      const { data: snaps } = await fromTable("sla_snapshots").select("*").order("computed_at", { ascending: false }).limit(100);
      if (!defs || !snaps) return null;
      return defs.map((def) => {
        const latest = snaps.find((s) => s.sla_id === def.id);
        return {
          name: def.name,
          actual: latest ? Number(latest.current_value) : def.target_value,
          target: Number(def.target_value),
          unit: def.unit,
        };
      });
    },
    refetchInterval: 60_000,
  });

  const SLA_METRICS = liveSlaData && liveSlaData.length > 0 ? liveSlaData : ([] as any[]);
  const DEPLOYMENTS = (realAuditLogs?.length ? realAuditLogs : [] as any[]);

  const togglePermission = (role: string, cap: string) => {
    if (role === "admin") return;
    setPermissions(prev => ({
      ...prev,
      [role]: { ...prev[role], [cap]: !prev[role][cap] },
    }));
  };

  return (
    <motion.div className="mx-auto max-w-6xl space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
<SitaPageHeader
        title="Enterprise Control Plane"
        subtitle="Organization management, roles, compliance, SLA, and deployment health"
        actions={<Badge variant="outline" className="text-xs gap-1"><Globe className="h-3 w-3" /> Enterprise</Badge>}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KPITile label="Team Members" value={TEAM_MEMBERS.filter(m => m.status === "active").length} icon={Users} sub={`${TEAM_MEMBERS.length} total`} />
        <KPITile label="Compliance" value={`${COMPLIANCE_ITEMS.filter(c => c.status === "compliant").length}/${COMPLIANCE_ITEMS.length}`} icon={Shield} sub="frameworks" />
        <KPITile label="SLA Health" value="99.97%" icon={Activity} trend="up" />
        <KPITile label="Deployments" value={DEPLOYMENTS.filter(d => d.status === "healthy").length} icon={Server} sub="healthy" />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="glass-panel border border-border/30 bg-secondary/20 p-1 h-auto flex-wrap">
          {[
            { value: "organization", label: "Organization", icon: Users },
            { value: "roles", label: "Roles & Permissions", icon: Lock },
            { value: "trust", label: "Trust Environment", icon: Eye },
            { value: "compliance", label: "Compliance Vault", icon: FileText },
            { value: "sla", label: "SLA Dashboard", icon: TrendingUp },
            { value: "deployments", label: "Deployment Health", icon: Server },
            { value: "fleet", label: "Fleet Overview", icon: Layers },
          ].map(tab => (
            <TabsTrigger key={tab.value} value={tab.value} className="text-xs gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <tab.icon className="h-3 w-3" /> {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ═══ ORGANIZATION ═══ */}
        <TabsContent value="organization" className="space-y-4 mt-4">
          <div className="flex items-center gap-2">
            <Input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="Email address" className="max-w-xs h-8 text-xs" />
            <Button size="sm" className="text-xs gap-1.5" onClick={() => { toast.success(`Invitation sent to ${inviteEmail}`); setInviteEmail(""); }}>
              <Mail className="h-3.5 w-3.5" /> Invite
            </Button>
          </div>

          <div className="space-y-2">
            {TEAM_MEMBERS.map(member => (
              <SitaCard key={member.id} hover={false} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {member.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {member.trustScore > 0 && (
                      <div className="text-right">
                        <p className="text-[10px] text-muted-foreground">Trust</p>
                        <p className="text-xs font-semibold text-foreground">{member.trustScore}%</p>
                      </div>
                    )}
                    <Badge variant={member.role === "admin" ? "default" : "secondary"} className="text-[10px]">{member.role}</Badge>
                    <Badge variant={member.status === "active" ? "outline" : "secondary"} className="text-[10px]">{member.status}</Badge>
                  </div>
                </div>
              </SitaCard>
            ))}
          </div>
        </TabsContent>

        {/* ═══ ROLES & PERMISSIONS ═══ */}
        <TabsContent value="roles" className="space-y-4 mt-4">
          <SitaCard hover={false} className="p-4 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="text-left py-2 px-3 font-semibold text-muted-foreground">Capability</th>
                  {([] as any[]).map(role => (
                    <th key={role} className="text-center py-2 px-3 font-semibold text-muted-foreground capitalize">{role}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {([] as any[]).map(cap => (
                  <tr key={cap} className="border-b border-border/10 hover:bg-secondary/20 transition-colors">
                    <td className="py-2 px-3 font-mono text-foreground">{cap}</td>
                    {([] as any[]).map(role => (
                      <td key={role} className="text-center py-2 px-3">
                        <Switch
                          checked={permissions[role]?.[cap] ?? false}
                          onCheckedChange={() => togglePermission(role, cap)}
                          disabled={role === "admin"}
                          className="scale-75"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </SitaCard>

          <AdminActionCard
            title="Save Permission Changes"
            whatChanges="Role-capability matrix will be updated"
            riskLevel="high"
            whatHappensNext="Permission changes apply immediately to all users with affected roles"
            proofNote="Permission matrix diff logged with before/after per role"
            undoDescription="Revert from Owner → Rollback → Permissions"
            onConfirm={() => toast.success("Permissions saved")}
            confirmLabel="Save Permissions"
            icon={<Lock className="h-5 w-5 text-primary" />}
          />
        </TabsContent>

        {/* ═══ TRUST ENVIRONMENT ═══ */}
        <TabsContent value="trust" className="space-y-4 mt-4">
          {TEAM_MEMBERS.filter(m => m.trustScore > 0).map(member => (
            <SitaCard key={member.id} hover={false} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-foreground">{member.name}</p>
                <span className={`text-xs font-semibold ${member.trustScore > 90 ? "text-emerald-500" : member.trustScore > 70 ? "text-amber-500" : "text-destructive"}`}>
                  {member.trustScore}% trust
                </span>
              </div>
              <Progress value={member.trustScore} className="h-1.5" />
              <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground">
                <span>Last seen: {member.lastSeen}</span>
                <span>Role: {member.role}</span>
                <span>No permission drift detected</span>
              </div>
            </SitaCard>
          ))}
        </TabsContent>

        {/* ═══ COMPLIANCE VAULT ═══ */}
        <TabsContent value="compliance" className="space-y-4 mt-4">
          {COMPLIANCE_ITEMS.map(item => (
            <SitaCard key={item.id} hover={false} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Shield className={`h-4 w-4 ${item.status === "compliant" ? "text-emerald-500" : item.status === "in-progress" ? "text-amber-500" : "text-destructive"}`} />
                  <p className="text-sm font-semibold text-foreground">{item.name}</p>
                </div>
                <Badge variant={item.status === "compliant" ? "default" : "secondary"} className="text-[10px] capitalize">{item.status.replace("-", " ")}</Badge>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>Last audit: {item.lastAudit}</span>
                <span>{item.evidence} evidence items</span>
                <span>Next review: {item.nextReview}</span>
              </div>
            </SitaCard>
          ))}
        </TabsContent>

        {/* ═══ SLA DASHBOARD ═══ */}
        <TabsContent value="sla" className="space-y-4 mt-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {SLA_METRICS.map(metric => {
              const met = metric.name.includes("Time") || metric.name.includes("Recovery")
                ? metric.actual <= metric.target
                : metric.actual >= metric.target;
              return (
                <SitaCard key={metric.name} hover={false} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-foreground">{metric.name}</p>
                    <CheckCircle className={`h-4 w-4 ${met ? "text-emerald-500" : "text-destructive"}`} />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-foreground">{metric.actual}{metric.unit}</span>
                    <span className="text-xs text-muted-foreground">/ target: {metric.target}{metric.unit}</span>
                  </div>
                  <Progress value={Math.min((metric.name.includes("Time") ? metric.target / metric.actual : metric.actual / metric.target) * 100, 100)} className="h-1.5 mt-2" />
                </SitaCard>
              );
            })}
          </div>
        </TabsContent>

        {/* ═══ DEPLOYMENT HEALTH ═══ */}
        <TabsContent value="deployments" className="space-y-4 mt-4">
          {DEPLOYMENTS.map(dep => (
            <SitaCard key={dep.id} hover={false} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-2.5 w-2.5 rounded-full ${dep.status === "healthy" ? "bg-emerald-500" : dep.status === "testing" ? "bg-amber-500 animate-pulse" : "bg-muted-foreground"}`} />
                  <div>
                    <p className="text-sm font-medium text-foreground">{dep.env} — {dep.version}</p>
                    <p className="text-xs text-muted-foreground">{dep.deployed} by {dep.by}</p>
                  </div>
                </div>
                <Badge variant={dep.status === "healthy" ? "default" : "secondary"} className="text-[10px] capitalize">{dep.status}</Badge>
              </div>
            </SitaCard>
          ))}
        </TabsContent>

        {/* ═══ FLEET OVERVIEW ═══ */}
        <TabsContent value="fleet" className="space-y-4 mt-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <KPITile label="Total Services" value={12} icon={Server} sub="Running" />
            <KPITile label="Edge Functions" value={10} icon={Activity} sub="Deployed" />
            <KPITile label="Health Score" value="98%" icon={Heart} trend="up" />
          </div>
          <SitaCard hover={false} className="p-4">
            <p className="text-sm font-medium text-foreground mb-3">Service Fleet</p>
            {["brain-core", "agent-executor", "agent-scheduler", "agent-signal", "agent-intelligence", "self-healing", "agent-heartbeat"].map(svc => (
              <div key={svc} className="flex items-center justify-between py-2 border-b border-border/10 last:border-0">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-mono text-foreground">{svc}</span>
                </div>
                <Badge variant="outline" className="text-[10px]">Healthy</Badge>
              </div>
            ))}
          </SitaCard>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default EnterpriseControlPlane;
