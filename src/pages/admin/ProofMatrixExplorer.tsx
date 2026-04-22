import { useState } from "react";
import { motion } from "framer-motion";
import { FileCheck, CheckCircle, XCircle, Clock, Shield, Link2, Eye, Search, Filter, Layers, GitBranch, Hash, ArrowRight, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useReceiptVerification, useSharedMemory } from "@/contexts/SitaKernelContext";
import { DEMO_PROOFS } from "@/data/seed/admin-platform";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { useDataMode } from "@/contexts/DataModeContext";

interface ProofRecord {
  id: string;
  type: "action" | "approval" | "verification" | "rollback" | "payment" | "system";
  action: string;
  actor: string;
  timestamp: string;
  verified: boolean;
  receiptId?: string;
  evidenceCount: number;
  chain: string[];
  domain: string;
  finality: "tentative" | "provisional" | "committed" | "finalized" | "irreversible";
  rollbackEligible: boolean;
}

const TYPE_CONFIG: Record<string, { color: string; label: string }> = {
  action: { color: "text-blue-400", label: "Action" },
  approval: { color: "text-purple-400", label: "Approval" },
  verification: { color: "text-emerald-400", label: "Verification" },
  rollback: { color: "text-amber-400", label: "Rollback" },
  payment: { color: "text-green-400", label: "Payment" },
  system: { color: "text-muted-foreground", label: "System" },
};

const FINALITY_CONFIG: Record<string, { color: string }> = {
  tentative: { color: "text-muted-foreground" },
  provisional: { color: "text-amber-400" },
  committed: { color: "text-blue-400" },
  finalized: { color: "text-emerald-400" },
  irreversible: { color: "text-red-400" },
};

function timeAgo(d: string) {
  const diff = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}

export default function ProofMatrixExplorer() {
  const { isDemoMode } = useDataMode();
  const { verifyIntegrity, validateChain, detectTamper } = useReceiptVerification();
  const { entries: sharedMemoryEntries } = useSharedMemory("proof-context");
  const [tab, setTab] = useState("proofs");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = (isDemoMode ? DEMO_PROOFS : [] as typeof DEMO_PROOFS).filter(p => {
    if (typeFilter !== "all" && p.type !== typeFilter) return false;
    if (search && !p.action.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const verifiedCount = (isDemoMode ? DEMO_PROOFS : [] as typeof DEMO_PROOFS).filter(p => p.verified).length;
  const withReceipts = (isDemoMode ? DEMO_PROOFS : [] as typeof DEMO_PROOFS).filter(p => p.receiptId).length;
  const totalEvidence = (isDemoMode ? DEMO_PROOFS : [] as typeof DEMO_PROOFS).reduce((s, p) => s + p.evidenceCount, 0);

  // Coverage by domain
  const domainCoverage = (isDemoMode ? DEMO_PROOFS : [] as typeof DEMO_PROOFS).reduce((acc, p) => {
    acc[p.domain] = (acc[p.domain] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Proof Matrix Explorer</h1>
            <p className="text-sm text-muted-foreground">Receipt lineage, evidence chains, verification records, and finality tracking</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: "Total Proofs", value: (isDemoMode ? DEMO_PROOFS : [] as typeof DEMO_PROOFS).length, color: "text-foreground" },
          { label: "Verified", value: `${verifiedCount}/${(isDemoMode ? DEMO_PROOFS : [] as typeof DEMO_PROOFS).length}`, color: "text-emerald-400" },
          { label: "With Receipts", value: `${withReceipts}/${(isDemoMode ? DEMO_PROOFS : [] as typeof DEMO_PROOFS).length}`, color: "text-blue-400" },
          { label: "Evidence Items", value: totalEvidence, color: "text-purple-400" },
          { label: "Rollbackable", value: (isDemoMode ? DEMO_PROOFS : [] as typeof DEMO_PROOFS).filter(p => p.rollbackEligible).length, color: "text-amber-400" },
        ].map((k, i) => (
          <Card key={i} className="bg-card/50 border-border/50">
            <CardContent className="p-3 text-center">
              <p className={cn("text-xl font-bold", k.color)}>{k.value}</p>
              <p className="text-[9px] text-muted-foreground">{k.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-muted/30 border border-border/40 h-8 p-0.5 gap-0.5">
          {[
            { value: "proofs", label: "Proof Records", icon: FileCheck },
            { value: "coverage", label: "Coverage Matrix", icon: Shield },
            { value: "chains", label: "Evidence Chains", icon: Link2 },
          ].map(t => (
            <TabsTrigger key={t.value} value={t.value} className="text-[10px] h-7 px-2.5 gap-1"><t.icon className="h-3 w-3" />{t.label}</TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-4">
          <TabsContent value="proofs">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search proofs..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
              </div>
              <div className="flex gap-1">
                {["all", "action", "approval", "verification", "payment", "rollback", "system"].map(t => (
                  <button key={t} onClick={() => setTypeFilter(t)}
                    className={cn("px-2.5 py-1 rounded-md text-[10px] font-medium transition-colors capitalize", typeFilter === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground")}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              {filtered.map((proof, idx) => {
                const typeCfg = TYPE_CONFIG[proof.type];
                const finCfg = FINALITY_CONFIG[proof.finality];
                const isExpanded = expanded === proof.id;

                return (
                  <motion.div key={proof.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}>
                    <Card className="bg-card/50 border-border/50 hover:border-primary/20 transition-colors cursor-pointer" onClick={() => setExpanded(isExpanded ? null : proof.id)}>
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <FileCheck className={cn("w-4 h-4", typeCfg.color)} />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono text-muted-foreground">{proof.id}</span>
                                <Badge variant="outline" className={cn("text-[8px]", typeCfg.color)}>{typeCfg.label}</Badge>
                                <Badge variant="outline" className={cn("text-[8px] capitalize", finCfg.color)}>{proof.finality}</Badge>
                                {proof.verified && <CheckCircle className="w-3 h-3 text-emerald-400" />}
                                {proof.rollbackEligible && <Badge variant="outline" className="text-[8px] text-amber-400">Rollbackable</Badge>}
                              </div>
                              <p className="text-xs font-medium text-foreground mt-0.5">{proof.action}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                            <span>{proof.actor}</span>
                            <span>{timeAgo(proof.timestamp)}</span>
                            <span>{proof.evidenceCount} evidence</span>
                          </div>
                        </div>

                        {isExpanded && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 pt-3 border-t border-border/30 space-y-3">
                            {proof.receiptId && (
                              <div className="flex items-center gap-2 text-xs">
                                <Hash className="w-3 h-3 text-muted-foreground" />
                                <span className="text-muted-foreground">Receipt:</span>
                                <span className="font-mono text-primary">{proof.receiptId}</span>
                              </div>
                            )}
                            <div>
                              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Evidence Chain</p>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {proof.chain.map((node, ni) => (
                                  <div key={node} className="flex items-center gap-1.5">
                                    <Badge variant="outline" className="text-[9px] font-mono">{node}</Badge>
                                    {ni < proof.chain.length - 1 && <ArrowRight className="w-3 h-3 text-muted-foreground" />}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="coverage">
            <h3 className="text-sm font-semibold mb-4">Proof Coverage by Domain</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(domainCoverage).map(([domain, count]) => (
                <Card key={domain} className="bg-card/50 border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-foreground capitalize">{domain}</p>
                      <p className="text-lg font-bold text-primary">{count}</p>
                    </div>
                    <Progress value={(count / (isDemoMode ? DEMO_PROOFS : [] as typeof DEMO_PROOFS).length) * 100} className="h-1.5" />
                    <p className="text-[10px] text-muted-foreground mt-1">{Math.round((count / (isDemoMode ? DEMO_PROOFS : [] as typeof DEMO_PROOFS).length) * 100)}% of total proofs</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card className="bg-card/50 border-border/50 mt-4">
              <CardHeader className="pb-2"><CardTitle className="text-xs">Finality Distribution</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {(["tentative", "provisional", "committed", "finalized", "irreversible"] as const).map(f => {
                  const count = (isDemoMode ? DEMO_PROOFS : [] as typeof DEMO_PROOFS).filter(p => p.finality === f).length;
                  return (
                    <div key={f} className="flex items-center gap-2">
                      <span className={cn("text-[10px] w-20 capitalize", FINALITY_CONFIG[f].color)}>{f}</span>
                      <div className="flex-1 h-2 bg-muted/20 rounded-full overflow-hidden"><div className="h-full bg-primary/60 rounded-full" style={{ width: `${(count / (isDemoMode ? DEMO_PROOFS : [] as typeof DEMO_PROOFS).length) * 100}%` }} /></div>
                      <span className="text-[10px] text-foreground w-4 text-right">{count}</span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chains">
            <h3 className="text-sm font-semibold mb-4">Evidence Chain Visualization</h3>
            <div className="space-y-4">
              {(isDemoMode ? DEMO_PROOFS : [] as typeof DEMO_PROOFS).filter(p => p.chain.length >= 3).map(proof => (
                <Card key={proof.id} className="bg-card/50 border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] font-mono text-muted-foreground">{proof.id}</span>
                      <p className="text-xs font-medium text-foreground">{proof.action}</p>
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto pb-2">
                      {proof.chain.map((node, ni) => (
                        <div key={node} className="flex items-center gap-2">
                          <div className="px-3 py-2 rounded-lg bg-primary/5 border border-primary/20 text-center">
                            <p className="text-[10px] font-mono text-primary">{node}</p>
                          </div>
                          {ni < proof.chain.length - 1 && <ArrowRight className="w-3.5 h-3.5 text-primary/50 flex-shrink-0" />}
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                      <Badge variant="outline" className={cn("text-[8px]", FINALITY_CONFIG[proof.finality].color)}>{proof.finality}</Badge>
                      <span>{proof.evidenceCount} evidence items</span>
                      {proof.verified && <span className="text-emerald-400">✓ Verified</span>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
