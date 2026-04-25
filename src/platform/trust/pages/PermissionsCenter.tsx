import { PageSkeleton } from "@/components/sita/PageSkeleton";
import { SitaPageHeader, SitaCard, SitaCardTitle, SitaSectionHeader, SitaButton } from "@/components/sita/SitaCard";
import { KPITile, SitaTabs, EmptyState } from "@/components/sita/SitaComponents";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Shield, Lock, Eye, Users, Key, Plug, AlertTriangle, CheckCircle,
  ToggleLeft, ToggleRight, Zap, Brain, ChevronRight
} from "lucide-react";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";

const PermissionsCenter = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const activeTab = (() => {
    if (location.pathname.includes("/advisors")) return "advisors";
    if (location.pathname.includes("/connectors")) return "connectors";
    if (location.pathname.includes("/household")) return "household";
    if (location.pathname.includes("/devices")) return "devices";
    return "overview";
  })();

  const goTo = (key: string) => {
    if (key === "overview") navigate("/permissions");
    else navigate(`/permissions/${key}`);
  };

  // Advisors and their access
  const { data: advisors = [] } = useQuery({
    queryKey: ["perm_advisors", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await fromTable("advisor_registry").select("*").order("display_name");
      if (error) throw error;
      return data;
    },
  });

  // Connectors and their scopes
  const { data: connectors = [] } = useQuery({
    queryKey: ["perm_connectors", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await fromTable("connector_configs").select("*").order("service");
      if (error) throw error;
      return data;
    },
  });

  // Devices
  const { data: devices = [] } = useQuery({
    queryKey: ["perm_devices", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await fromTable("device_statuses").select("*").order("last_seen_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Policies for permission rules
  const { data: policies = [] } = useQuery({
    queryKey: ["perm_policies", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await fromTable("policies").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const activePolicies = policies.filter(p => p.active).length;

  return (
    <motion.div className="mx-auto max-w-6xl space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
<SitaPageHeader
        title="Permissions & Consent"
        subtitle="Control what SITA can access, who can approve, and how data is shared"
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KPITile label="Active Advisors" value={advisors.filter(a => a.active).length} icon={Brain} />
        <KPITile label="Connected Services" value={connectors.filter(c => c.status === "active").length} icon={Plug} />
        <KPITile label="Trusted Devices" value={devices.length} icon={Key} />
        <KPITile label="Active Policies" value={activePolicies} icon={Shield} />
      </div>

      <SitaTabs
        tabs={[
          { key: "overview", label: "Overview" },
          { key: "advisors", label: "Advisors", count: advisors.length },
          { key: "connectors", label: "Connectors", count: connectors.length },
          { key: "devices", label: "Devices", count: devices.length },
          { key: "household", label: "Household" },
        ]}
        active={activeTab}
        onChange={goTo}
      />

      {activeTab === "overview" && (
        <div className="space-y-4">
          <SitaSectionHeader title="Quick Actions" subtitle="Emergency controls and common permission changes" />
          <div className="grid gap-3 sm:grid-cols-2">
            <SitaCard hover={false} className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-destructive/10 p-2"><AlertTriangle className="h-5 w-5 text-destructive" /></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Emergency Freeze</p>
                  <p className="text-xs text-muted-foreground">Pause all automated actions immediately</p>
                </div>
                <SitaButton variant="danger" size="sm">Freeze All</SitaButton>
              </div>
            </SitaCard>
            <SitaCard hover={false} className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2"><Lock className="h-5 w-5 text-primary" /></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Revoke Delegations</p>
                  <p className="text-xs text-muted-foreground">Require manual approval for everything</p>
                </div>
                <SitaButton variant="secondary" size="sm">Revoke</SitaButton>
              </div>
            </SitaCard>
          </div>

          <SitaSectionHeader title="Permission Summary" subtitle="What SITA can do right now" />
          <div className="space-y-2">
            {[
              { label: "Read your calendar", status: "granted", domain: "Concierge" },
              { label: "Send emails on your behalf", status: "approval-required", domain: "Business" },
              { label: "Process payments", status: "approval-required", domain: "Money" },
              { label: "Access financial data", status: "granted", domain: "Money" },
              { label: "Manage household tasks", status: "granted", domain: "Concierge" },
              { label: "Execute workflows automatically", status: "threshold", domain: "System" },
            ].map((perm, i) => (
              <SitaCard key={i} hover={false} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {perm.status === "granted" ? <CheckCircle className="h-4 w-4 text-primary" /> : <Shield className="h-4 w-4 text-accent" />}
                    <div>
                      <p className="text-sm text-foreground">{perm.label}</p>
                      <p className="text-xs text-muted-foreground">{perm.domain}</p>
                    </div>
                  </div>
                  <TrustBadge level={perm.status === "granted" ? "verified" : "approval"} label={perm.status === "granted" ? "Always" : perm.status === "approval-required" ? "Ask first" : "Threshold"} size="sm" />
                </div>
              </SitaCard>
            ))}
          </div>
        </div>
      )}

      {activeTab === "advisors" && (
        <div className="space-y-2">
          {advisors.length === 0 ? (
            <EmptyState icon={Brain} title="No advisors configured" description="Register advisors to control their access and capabilities." />
          ) : (
            advisors.map(adv => (
              <SitaCard key={adv.id} hover={false} className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${adv.active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                      {adv.display_name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{adv.display_name}</p>
                      <p className="text-xs text-muted-foreground">
                        Trust: {Math.round(Number(adv.trust_threshold) * 100)}% · Scope: {adv.memory_scope} · {(adv.tool_access as string[])?.length || 0} tools
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrustBadge level={adv.active ? "verified" : "low-confidence"} label={adv.active ? "Active" : "Disabled"} size="sm" />
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </SitaCard>
            ))
          )}
        </div>
      )}

      {activeTab === "connectors" && (
        <div className="space-y-2">
          {connectors.length === 0 ? (
            <EmptyState icon={Plug} title="No connectors" description="Connect services to see and control their permissions." />
          ) : (
            connectors.map(conn => (
              <SitaCard key={conn.id} hover={false} className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Plug className={`h-4 w-4 ${conn.status === "active" ? "text-primary" : "text-muted-foreground"}`} />
                    <div>
                      <p className="text-sm font-medium text-foreground capitalize">{conn.service}</p>
                      <p className="text-xs text-muted-foreground">
                        Last sync: {conn.last_sync_at ? new Date(conn.last_sync_at).toLocaleString() : "Never"}
                      </p>
                    </div>
                  </div>
                  <TrustBadge level={conn.status === "active" ? "verified" : "low-confidence"} label={conn.status} size="sm" />
                </div>
              </SitaCard>
            ))
          )}
        </div>
      )}

      {activeTab === "devices" && (
        <div className="space-y-2">
          {devices.length === 0 ? (
            <EmptyState icon={Key} title="No devices" description="Trusted devices will appear here once enrolled." />
          ) : (
            devices.map(dev => (
              <SitaCard key={dev.id} hover={false} className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Key className={`h-4 w-4 ${dev.status === "online" ? "text-primary" : "text-muted-foreground"}`} />
                    <div>
                      <p className="text-sm font-medium text-foreground">{dev.device_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {dev.device_type} · {dev.os || "Unknown OS"} · Trust: {Math.round(Number((dev.metadata && typeof dev.metadata === 'object' && 'trust_score' in dev.metadata ? ((dev.metadata as Record<string, unknown>)?.trust_score ?? 0) : 0) || 0) * 100)}%
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {(dev.metadata && typeof dev.metadata === 'object' && 'is_primary' in dev.metadata && ((dev.metadata as Record<string, unknown>)?.is_primary)) && <span className="text-[10px] bg-primary/10 text-primary rounded-md px-1.5 py-0.5">Primary</span>}
                    <TrustBadge level={dev.status === "online" ? "verified" : "low-confidence"} label={dev.status} size="sm" />
                  </div>
                </div>
              </SitaCard>
            ))
          )}
        </div>
      )}

      {activeTab === "household" && (
        <div className="space-y-4">
          <SitaSectionHeader title="Household Permissions" subtitle="Control what's shared vs private within your household" />
          {[
            { label: "Calendar events", shared: true, editable: true },
            { label: "Task assignments", shared: true, editable: true },
            { label: "Financial data", shared: false, editable: false },
            { label: "Business contacts", shared: false, editable: false },
            { label: "Grocery lists", shared: true, editable: true },
            { label: "Travel plans", shared: true, editable: false },
          ].map((perm, i) => (
            <SitaCard key={i} hover={false} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {perm.shared ? <Users className="h-4 w-4 text-primary" /> : <Lock className="h-4 w-4 text-muted-foreground" />}
                  <div>
                    <p className="text-sm text-foreground">{perm.label}</p>
                    <p className="text-xs text-muted-foreground">{perm.editable ? "Everyone can edit" : perm.shared ? "View only" : "Private"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TrustBadge level={perm.shared ? "verified" : "review"} label={perm.shared ? "Shared" : "Private"} size="sm" />
                </div>
              </div>
            </SitaCard>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default PermissionsCenter;
