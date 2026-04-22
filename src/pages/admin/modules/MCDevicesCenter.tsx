import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Smartphone, Laptop, Tablet, Watch, Monitor, Shield, RefreshCw,
  AlertTriangle, CheckCircle, XCircle, Search, Filter, ChevronRight,
  Wifi, WifiOff, Lock, Unlock, BarChart3, TrendingUp
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useDataMode } from "@/contexts/DataModeContext";

const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };

const DEMO_DEVICES = [
  { id: "d1", name: "MacBook Pro 16″", platform: "macOS", version: "14.3", trust: "verified", status: "online", syncCapable: true, meshCapable: true, lastSeen: "Now", icon: Laptop },
  { id: "d2", name: "iPhone 15 Pro", platform: "iOS", version: "17.4", trust: "verified", status: "online", syncCapable: true, meshCapable: true, lastSeen: "Now", icon: Smartphone },
  { id: "d3", name: "iPad Air M2", platform: "iPadOS", version: "17.4", trust: "verified", status: "online", syncCapable: true, meshCapable: false, lastSeen: "2m ago", icon: Tablet },
  { id: "d4", name: "Pixel 8 Pro", platform: "Android", version: "14", trust: "pending", status: "offline", syncCapable: true, meshCapable: true, lastSeen: "3h ago", icon: Smartphone },
  { id: "d5", name: "Apple Watch Ultra 2", platform: "watchOS", version: "10.4", trust: "verified", status: "online", syncCapable: false, meshCapable: false, lastSeen: "Now", icon: Watch },
  { id: "d6", name: "Windows Desktop", platform: "Windows", version: "11", trust: "revoked", status: "offline", syncCapable: true, meshCapable: true, lastSeen: "14d ago", icon: Monitor },
  { id: "d7", name: "Samsung Galaxy Tab S9", platform: "Android", version: "14", trust: "verified", status: "offline", syncCapable: true, meshCapable: false, lastSeen: "1d ago", icon: Tablet },
  { id: "d8", name: "Chrome OS Flex", platform: "ChromeOS", version: "122", trust: "pending", status: "offline", syncCapable: true, meshCapable: false, lastSeen: "5d ago", icon: Laptop },
];

const PLATFORM_STATS = [
  { platform: "iOS", count: 1842, percent: 38 },
  { platform: "Android", count: 1256, percent: 26 },
  { platform: "macOS", count: 893, percent: 18 },
  { platform: "Windows", count: 542, percent: 11 },
  { platform: "Other", count: 324, percent: 7 },
];

const trustColor: Record<string, string> = {
  verified: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  pending: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  revoked: "text-red-400 bg-red-500/10 border-red-500/20",
};

const trustIcon: Record<string, React.ElementType> = {
  verified: CheckCircle, pending: AlertTriangle, revoked: XCircle,
};

const MCDevicesCenter = () => {
  const { isDemo } = useAuth();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");

  const filtered = ([] as typeof DEMO_DEVICES).filter(d => {
    if (filter !== "all" && d.trust !== filter) return false;
    if (search && !d.name.toLowerCase().includes(search.toLowerCase()) && !d.platform.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Devices</h1>
          <p className="text-sm text-muted-foreground mt-1">Fleet-level device management and trust oversight</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5"><RefreshCw className="h-3 w-3" /> Refresh Fleet</Button>
        </div>
      </div>

      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
        {/* Platform Distribution */}
        <motion.div variants={fadeUp}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /> Platform Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-3">
                {PLATFORM_STATS.map(p => (
                  <div key={p.platform} className="text-center p-3 rounded-lg bg-muted/10 border border-border/10">
                    <p className="text-lg font-bold text-foreground">{p.count.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground">{p.platform}</p>
                    <div className="mt-1.5 h-1.5 bg-muted/20 rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${p.percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Trust Summary */}
        <motion.div variants={fadeUp} className="grid grid-cols-3 gap-3">
          {[
            { label: "Verified", count: ([] as typeof DEMO_DEVICES).filter(d => d.trust === "verified").length, total: ([] as typeof DEMO_DEVICES).length, color: "text-emerald-400" },
            { label: "Pending Review", count: ([] as typeof DEMO_DEVICES).filter(d => d.trust === "pending").length, total: ([] as typeof DEMO_DEVICES).length, color: "text-amber-400" },
            { label: "Revoked", count: ([] as typeof DEMO_DEVICES).filter(d => d.trust === "revoked").length, total: ([] as typeof DEMO_DEVICES).length, color: "text-red-400" },
          ].map(s => (
            <Card key={s.label} className="hover:-translate-y-0.5 transition-transform">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{s.label}</span>
                  <span className={`text-xl font-bold ${s.color}`}>{s.count}</span>
                </div>
                <div className="mt-2 h-1 bg-muted/20 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${s.label === "Verified" ? "bg-emerald-500" : s.label === "Pending Review" ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${(s.count / s.total) * 100}%` }} />
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Device List */}
        <motion.div variants={fadeUp}>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Device Fleet</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search devices…" className="h-8 text-xs pl-8 w-48" />
                  </div>
                  <div className="flex items-center gap-1">
                    {["all", "verified", "pending", "revoked"].map(f => (
                      <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" className="h-7 text-[10px] px-2.5 capitalize" onClick={() => setFilter(f)}>{f}</Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1.5">
                {filtered.map(device => {
                  const TrustIcon = trustIcon[device.trust];
                  const DeviceIcon = device.icon;
                  return (
                    <div key={device.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/10 hover:bg-muted/20 transition-colors group">
                      <DeviceIcon className="h-5 w-5 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">{device.name}</span>
                          <Badge variant="outline" className="text-[9px] h-4">{device.platform} {device.version}</Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-1">{device.status === "online" ? <Wifi className="h-2.5 w-2.5 text-emerald-400" /> : <WifiOff className="h-2.5 w-2.5" />} {device.status}</span>
                          <span>Last: {device.lastSeen}</span>
                          {device.syncCapable && <span className="text-primary">Sync ✓</span>}
                          {device.meshCapable && <span className="text-primary">Mesh ✓</span>}
                        </div>
                      </div>
                      <Badge variant="outline" className={`text-[9px] h-5 gap-1 ${trustColor[device.trust]}`}>
                        <TrustIcon className="h-2.5 w-2.5" /> {device.trust}
                      </Badge>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2">Revoke</Button>
                        <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2">Reauth</Button>
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={fadeUp}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {[
                { label: "Revoke All Untrusted", icon: XCircle },
                { label: "Require Fleet Reauth", icon: Lock },
                { label: "Block Update Cohort", icon: AlertTriangle },
                { label: "Exclude Device Class", icon: Filter },
                { label: "Inspect Failure Cluster", icon: Search },
              ].map(a => (
                <Button key={a.label} variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                  <a.icon className="h-3 w-3" /> {a.label}
                </Button>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default MCDevicesCenter;
