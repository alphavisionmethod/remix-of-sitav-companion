// ═══════════════════════════════════════════════════════════════
// SITA OS — Users Admin Control Center
// User roster, org mapping, trust state, admin actions
// Uses shared admin components and typed view models
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { SitaCard, SitaCardTitle } from "@/components/sita/SitaCard";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { AdminPageHeader, StatusBadge, TrustRibbon } from "@/components/sita/admin";
import type { UserRowView } from "@/packages/contracts";
import {
  Users, Search, Shield, Wifi, AlertTriangle, CheckCircle, Eye,
  ChevronRight, CreditCard, Headphones, Star, Clock,
} from "lucide-react";
import { useAdminUsers } from "@/hooks/use-domain-data";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { PageShell } from "@/components/sita/PageShell";

export default function UsersAdminPage() {
  const { data: users = [] } = useAdminUsers();
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserRowView | null>(null);

  const filtered = users.filter(u =>
    search === "" || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.includes(search) || u.org.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageShell>
    <div className="max-w-[1400px] mx-auto space-y-5">
<AdminPageHeader icon={Users} title="Users & Organizations" subtitle="User roster, trust state, connector health, and support diagnostics">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full mt-5">
          {[
            { label: "Total Users", value: users.length, ok: true },
            { label: "Enterprise", value: users.filter(u => u.tier === "enterprise").length, ok: true },
            { label: "Support Flags", value: users.reduce((s, u) => s + u.supportFlags, 0), ok: users.reduce((s, u) => s + u.supportFlags, 0) === 0 },
            { label: "Pending Approvals", value: users.reduce((s, u) => s + u.approvalBurden, 0), ok: true },
          ].map(m => (
            <div key={m.label} className={cn("rounded-xl border px-3 py-2.5 text-center", m.ok ? "border-border bg-card/50" : "border-accent/20 bg-accent/5")}>
              <p className={cn("font-display text-lg font-bold", m.ok ? "text-foreground" : "text-accent")}>{m.value}</p>
              <p className="text-[9px] text-muted-foreground">{m.label}</p>
            </div>
          ))}
        </div>
      </AdminPageHeader>

      <TrustRibbon />

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users, emails, or organizations..." className="pl-10 h-9 text-xs" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-2">
          {filtered.map((user, i) => (
            <motion.div key={user.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className={cn("flex items-center gap-4 rounded-xl border p-4 cursor-pointer transition-all",
                selectedUser?.id === user.id ? "border-primary/30 bg-primary/3 shadow-sm" : "border-border bg-card/80 hover:border-primary/15"
              )}
              onClick={() => setSelectedUser(user)}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 font-display text-sm font-bold text-primary">
                {user.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold text-foreground">{user.name}</p>
                  <StatusBadge status={user.tier} size="xs" />
                  <StatusBadge status={user.trustState} size="xs" />
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">{user.email} · {user.org}</p>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                <span><Wifi className="h-3 w-3 inline mr-0.5" />{user.connectorCount}</span>
                {user.supportFlags > 0 && <span className="text-accent"><Headphones className="h-3 w-3 inline mr-0.5" />{user.supportFlags}</span>}
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </motion.div>
          ))}
        </div>

        <div>
          {selectedUser ? (
            <SitaCard hover={false} className="sticky top-20">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 font-display text-sm font-bold text-primary">
                  {selectedUser.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{selectedUser.name}</p>
                  <p className="text-[10px] text-muted-foreground">{selectedUser.email}</p>
                </div>
              </div>

              <div className="space-y-2">
                {[
                  { label: "Organization", value: selectedUser.org, icon: Users },
                  { label: "Plan", value: selectedUser.tier, icon: CreditCard },
                  { label: "Trust State", value: selectedUser.trustState, icon: Shield },
                  { label: "Connectors", value: `${selectedUser.connectorCount} attached`, icon: Wifi },
                  { label: "Incident Exposure", value: `${selectedUser.incidentExposure} active`, icon: AlertTriangle },
                  { label: "Approval Burden", value: `${selectedUser.approvalBurden} pending`, icon: CheckCircle },
                  { label: "Support Flags", value: `${selectedUser.supportFlags}`, icon: Headphones },
                  { label: "Last Active", value: new Date(selectedUser.lastActive).toLocaleString(), icon: Clock },
                ].map(f => (
                  <div key={f.label} className="flex items-center gap-3 rounded-lg bg-secondary/20 px-3 py-2">
                    <f.icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-[10px] text-muted-foreground w-28">{f.label}</span>
                    <span className="text-xs text-foreground">{f.value}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 space-y-2">
                <button className="w-full rounded-lg border border-border py-2 text-[11px] text-muted-foreground hover:bg-secondary transition-colors">
                  <Eye className="h-3 w-3 inline mr-1" /> Support-Safe Review
                </button>
                <button className="w-full rounded-lg border border-border py-2 text-[11px] text-muted-foreground hover:bg-secondary transition-colors">
                  <Shield className="h-3 w-3 inline mr-1" /> View Trust History
                </button>
              </div>
            </SitaCard>
          ) : (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center">
              <Users className="h-8 w-8 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-xs text-muted-foreground">Select a user to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
    </PageShell>
  );
}
