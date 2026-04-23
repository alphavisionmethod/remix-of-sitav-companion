import { PageShell } from "@/components/sita/PageShell";
import { motion } from "framer-motion";
import { Globe, Shield, CheckCircle, AlertTriangle, Settings, Eye, Undo2, FileText, ArrowRight, Clock, Lock, Server } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useWebsiteManager } from "@/contexts/SitaKernelContext";
import DPOSubNav from "./DPOSubNav";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";

const DEMO_ENVIRONMENTS: any[] = [];

// Production fallback — seed data removed
const DEMO_DOMAINS: any[] = [];

export default function DomainPublishManager() {
  const { pages: managedPages, domains: managedDomains, getStats: getWebsiteStats } = useWebsiteManager();
  const [newDomain, setNewDomain] = useState("");

  return (
    <PageShell width="wide">
      <DPOSubNav />
<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">Domain / Publish / Environment Manager</h1>
        <p className="text-sm text-muted-foreground">Domains, staging, publishing rules, rollback & release management</p>
      </motion.div>

      {/* Domains */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2"><Globe className="w-4 h-4 text-blue-400" /> Domains</CardTitle>
            <div className="flex gap-2">
              <Input placeholder="Add domain…" value={newDomain} onChange={e => setNewDomain(e.target.value)} className="w-48 h-8 text-xs" />
              <Button size="sm" variant="outline" className="h-8 text-xs">Add</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {([] as any[]).map(d => (
            <div key={d.domain} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                {d.ssl ? <Lock className="w-3 h-3 text-green-400" /> : <AlertTriangle className="w-3 h-3 text-red-400" />}
                <div>
                  <span className="text-sm font-medium text-foreground">{d.domain}</span>
                  <Badge variant="secondary" className="ml-2 text-[10px]">{d.type}</Badge>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-muted-foreground">Published {d.lastPublished}</span>
                {d.dnsOk ? (
                  <Badge variant="default" className="text-[10px]"><CheckCircle className="w-3 h-3 mr-1" /> DNS OK</Badge>
                ) : (
                  <Badge variant="destructive" className="text-[10px]"><AlertTriangle className="w-3 h-3 mr-1" /> DNS Issue</Badge>
                )}
                <Badge variant={d.status === "active" ? "default" : "secondary"} className="text-[10px]">{d.status}</Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Environments */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Server className="w-4 h-4 text-purple-400" /> Environments</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {([] as any[]).map(e => (
            <div key={e.env} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{e.env}</span>
                  <Badge variant={e.status === "live" ? "default" : "secondary"} className="text-[10px]">{e.status}</Badge>
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground">
                  <span className="font-mono">{e.url}</span>
                  <span>·</span>
                  <span>{e.version}</span>
                  <span>·</span>
                  <span>Deployed {e.lastDeploy} by {e.deployer}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="h-6 text-[10px]"><Eye className="w-3 h-3 mr-1" /> Preview</Button>
                {e.env !== "Production" && (
                  <Button variant="outline" size="sm" className="h-6 text-[10px]"><ArrowRight className="w-3 h-3 mr-1" /> Promote</Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Publish History */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><FileText className="w-4 h-4 text-green-400" /> Publish History</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {([] as any[]).map(p => (
              <div key={p.version} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-mono font-medium text-foreground">{p.version}</span>
                    <Badge variant={p.status === "live" ? "default" : "secondary"} className="text-[10px]">{p.status}</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{p.changes}</p>
                  <p className="text-[10px] text-muted-foreground">{p.date} · Approved by {p.approvedBy}</p>
                </div>
                {p.status !== "live" && (
                  <Button variant="ghost" size="sm" className="h-6 text-[10px]"><Undo2 className="w-3 h-3 mr-1" /> Rollback</Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Publishing Rules */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Shield className="w-4 h-4 text-amber-400" /> Publishing Rules</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {([] as any[]).map(r => (
              <div key={r.rule} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span className="text-xs text-foreground">{r.rule}</span>
                <Badge variant={r.active ? "default" : "secondary"} className="text-[10px]">{r.active ? "Active" : "Off"}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
