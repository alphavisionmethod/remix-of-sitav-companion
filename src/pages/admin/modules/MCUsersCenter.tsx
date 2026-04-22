import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users, Search, Filter, Shield, Activity, ChevronRight, Mail,
  Calendar, CreditCard, Smartphone, TrendingUp, UserCheck, UserX
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useDataMode } from "@/contexts/DataModeContext";

const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };

const DEMO_USERS = [
  { id: "u1", name: "Sarah Chen", email: "sarah@example.com", plan: "Pro", devices: 3, syncHealth: 98, trustScore: 95, joined: "2024-01-15", status: "active", lastActive: "2m ago" },
  { id: "u2", name: "Marcus Rivera", email: "marcus@example.com", plan: "Business", devices: 5, syncHealth: 94, trustScore: 88, joined: "2023-11-20", status: "active", lastActive: "1h ago" },
  { id: "u3", name: "Aisha Patel", email: "aisha@example.com", plan: "Pro", devices: 2, syncHealth: 100, trustScore: 97, joined: "2024-03-01", status: "active", lastActive: "Now" },
  { id: "u4", name: "James Wright", email: "james@example.com", plan: "Free", devices: 1, syncHealth: 76, trustScore: 72, joined: "2024-02-10", status: "inactive", lastActive: "5d ago" },
  { id: "u5", name: "Li Wei", email: "li.wei@example.com", plan: "Business", devices: 4, syncHealth: 91, trustScore: 90, joined: "2023-09-05", status: "active", lastActive: "30m ago" },
  { id: "u6", name: "Elena Voronova", email: "elena@example.com", plan: "Enterprise", devices: 8, syncHealth: 97, trustScore: 99, joined: "2023-06-12", status: "active", lastActive: "Now" },
];

const MCUsersCenter = () => {
  ;
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("all");

  const filtered = ([] as typeof DEMO_USERS).filter(u => {
    if (planFilter !== "all" && u.plan !== planFilter) return false;
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Users</h1>
        <p className="text-sm text-muted-foreground mt-1">Platform-level user management and insights</p>
      </div>

      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
        {/* Summary Cards */}
        <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total Users", value: "4,857", change: "+142 this month", icon: Users, color: "text-primary" },
            { label: "Active Now", value: "1,203", change: "24.8% of total", icon: Activity, color: "text-emerald-400" },
            { label: "Avg Trust Score", value: "89.3", change: "+2.1 from last month", icon: Shield, color: "text-primary" },
            { label: "Growth Rate", value: "+8.2%", change: "MoM", icon: TrendingUp, color: "text-emerald-400" },
          ].map(m => (
            <Card key={m.label} className="hover:-translate-y-0.5 transition-transform">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <m.icon className={`h-4 w-4 ${m.color}`} />
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{m.label}</span>
                </div>
                <p className="text-xl font-bold text-foreground">{m.value}</p>
                <p className="text-[10px] text-muted-foreground">{m.change}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Plan Distribution */}
        <motion.div variants={fadeUp}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Plan Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { plan: "Free", count: 2841, percent: 58 },
                  { plan: "Pro", count: 1256, percent: 26 },
                  { plan: "Business", count: 612, percent: 13 },
                  { plan: "Enterprise", count: 148, percent: 3 },
                ].map(p => (
                  <div key={p.plan} className="text-center p-3 rounded-lg bg-muted/10 border border-border/10">
                    <p className="text-lg font-bold text-foreground">{p.count.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground">{p.plan}</p>
                    <div className="mt-1 h-1 bg-muted/20 rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${p.percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* User List */}
        <motion.div variants={fadeUp}>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">User Directory</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users…" className="h-8 text-xs pl-8 w-48" />
                  </div>
                  <div className="flex items-center gap-1">
                    {["all", "Free", "Pro", "Business", "Enterprise"].map(f => (
                      <Button key={f} variant={planFilter === f ? "default" : "outline"} size="sm" className="h-7 text-[10px] px-2" onClick={() => setPlanFilter(f)}>{f}</Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {filtered.map(user => (
                  <div key={user.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/10 hover:bg-muted/20 transition-colors group">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                      {user.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">{user.name}</span>
                        <Badge variant="outline" className="text-[9px] h-4">{user.plan}</Badge>
                        {user.status === "active" ? <UserCheck className="h-3 w-3 text-emerald-400" /> : <UserX className="h-3 w-3 text-muted-foreground" />}
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-0.5">
                        <span className="flex items-center gap-1"><Mail className="h-2.5 w-2.5" /> {user.email}</span>
                        <span className="flex items-center gap-1"><Smartphone className="h-2.5 w-2.5" /> {user.devices} devices</span>
                        <span>Sync: {user.syncHealth}%</span>
                        <span>Trust: {user.trustScore}</span>
                        <span>Active: {user.lastActive}</span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default MCUsersCenter;
