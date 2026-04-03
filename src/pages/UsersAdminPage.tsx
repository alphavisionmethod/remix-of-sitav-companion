// ═══════════════════════════════════════════════════════════════
// SITA OS — Users Admin Control Center
// User roster, org mapping, trust state, admin actions
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { SitaCard, SitaCardTitle } from "@/components/sita/SitaCard";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Users, Search, Shield, Wifi, AlertTriangle, CheckCircle, Eye,
  ChevronRight, CreditCard, Headphones, Star,
} from "lucide-react";

interface UserView {
  id: string;
  name: string;
  email: string;
  org: string;
  tier: "starter" | "professional" | "enterprise";
  trustState: "verified" | "review" | "new";
  connectorCount: number;
  incidentExposure: number;
  approvalBurden: number;
  supportFlags: number;
  lastActive: string;
}

const mockUsers: UserView[] = [
  { id: "u1", name: "Alex Rivera", email: "alex@acme.co", org: "Acme Corp", tier: "enterprise", trustState: "verified", connectorCount: 5, incidentExposure: 0, approvalBurden: 2, supportFlags: 0, lastActive: new Date(Date.now() - 300000).toISOString() },
  { id: "u2", name: "Jordan Chen", email: "jordan@startup.io", org: "Startup Inc", tier: "professional", trustState: "verified", connectorCount: 3, incidentExposure: 1, approvalBurden: 5, supportFlags: 1, lastActive: new Date(Date.now() - 3600000).toISOString() },
  { id: "u3", name: "Sam Patel", email: "sam@solo.dev", org: "Solo Dev", tier: "starter", trustState: "new", connectorCount: 1, incidentExposure: 0, approvalBurden: 0, supportFlags: 0, lastActive: new Date(Date.now() - 86400000).toISOString() },
  { id: "u4", name: "Morgan Lee", email: "morgan@bigcorp.com", org: "BigCorp", tier: "enterprise", trustState: "review", connectorCount: 8, incidentExposure: 2, approvalBurden: 12, supportFlags: 3, lastActive: new Date(Date.now() - 7200000).toISOString() },
];

const tierBadge: Record<string, string> = {
  starter: "", professional: "bg-primary/10 text-primary", enterprise: "bg-sita-gold/10 text-sita-gold",
};

const trustBadge: Record<string, string> = {
  verified: "bg-trust-verified/10 text-trust-safe", review: "bg-accent/10 text-accent", new: "bg-muted text-muted-foreground",
};

export default function UsersAdminPage() {
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserView | null>(null);

  const filtered = mockUsers.filter(u =>
    search === "" || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.includes(search) || u.org.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-5">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/5 via-card to-card p-6"
      >
        <div className="flex items-center gap-4 mb-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 shadow-lg shadow-primary/10">
            <Users className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">Users & Organizations</h1>
            <p className="text-sm text-muted-foreground">User roster, trust state, connector health, and support diagnostics</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total Users", value: mockUsers.length },
            { label: "Enterprise", value: mockUsers.filter(u => u.tier === "enterprise").length },
            { label: "Support Flags", value: mockUsers.reduce((s, u) => s + u.supportFlags, 0), accent: true },
            { label: "Pending Approvals", value: mockUsers.reduce((s, u) => s + u.approvalBurden, 0) },
          ].map(m => (
            <div key={m.label} className={cn("rounded-xl border px-3 py-2.5 text-center", m.accent ? "border-accent/20 bg-accent/5" : "border-border bg-card/50")}>
              <p className={cn("font-display text-lg font-bold", m.accent ? "text-accent" : "text-foreground")}>{m.value}</p>
              <p className="text-[9px] text-muted-foreground">{m.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users, emails, or organizations..." className="pl-10 h-9 text-xs" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* User List */}
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
                  <Badge variant="outline" className={cn("text-[9px]", tierBadge[user.tier])}>{user.tier}</Badge>
                  <Badge variant="outline" className={cn("text-[9px]", trustBadge[user.trustState])}>{user.trustState}</Badge>
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

        {/* User Detail */}
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

              <div className="space-y-3">
                {[
                  { label: "Organization", value: selectedUser.org, icon: Users },
                  { label: "Plan", value: selectedUser.tier, icon: CreditCard },
                  { label: "Trust State", value: selectedUser.trustState, icon: Shield },
                  { label: "Connectors", value: `${selectedUser.connectorCount} attached`, icon: Wifi },
                  { label: "Incident Exposure", value: `${selectedUser.incidentExposure} active`, icon: AlertTriangle },
                  { label: "Approval Burden", value: `${selectedUser.approvalBurden} pending`, icon: CheckCircle },
                  { label: "Support Flags", value: `${selectedUser.supportFlags}`, icon: Headphones },
                  { label: "Last Active", value: new Date(selectedUser.lastActive).toLocaleString(), icon: Eye },
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
  );
}
