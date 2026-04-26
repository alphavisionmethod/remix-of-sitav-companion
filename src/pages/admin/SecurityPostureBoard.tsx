import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Lock, Shield, CheckCircle, AlertTriangle, XCircle, RefreshCw, Key, Database, Server, Eye, Fingerprint, Clock } from "lucide-react";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { useSecurityFabric } from "@/hooks/use-security-fabric";
import {
  ENCRYPTION_BADGE,
  SECRET_BADGE,
  SECRET_REGISTRY,
  CLASSIFICATION_MATRIX,
  KEY_ROTATION_SCHEDULE,
  DOMAIN_POSTURE_BASELINE,
} from "./_config/SecurityPostureBoard.config";
const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

const SecurityPostureBoard = () => {
  const [tab, setTab] = useState("overview");
  const { data: fabric } = useSecurityFabric();
  // Live fabric overlays the authored baseline; fall back to the catalog when fabric is empty.
  const posture = (fabric?.domainPosture && fabric.domainPosture.length > 0)
    ? fabric.domainPosture
    : DOMAIN_POSTURE_BASELINE;

  const fullEncryption = posture.filter((p) => p.encryption === "full").length;
  const allRls = posture.filter((p) => p.rlsEnabled).length;
  const totalGaps = posture.reduce((s, p) => s + p.gaps.length, 0);
  const verifiedSecrets = SECRET_REGISTRY.filter((s) => s.status === "verified").length;
  const keyRotationDueSoon = KEY_ROTATION_SCHEDULE.some((k) => k.status === "due-soon");

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
<div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Lock className="h-6 w-6 text-primary" /> Data Protection Posture
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Encryption · Secrets integrity · Data classification · Key rotation · Protection gaps</p>
        </div>
        <Button variant="outline" size="sm"><RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Verify All</Button>
      </div>

      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
        <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "Encryption Coverage", value: `${fullEncryption}/${posture.length}`, color: fullEncryption === posture.length ? "text-emerald-500" : "text-amber-500" },
            { label: "RLS Enabled", value: `${allRls}/${posture.length}`, color: allRls === posture.length ? "text-emerald-500" : "text-red-500" },
            { label: "Secrets Verified", value: `${verifiedSecrets}/${SECRET_REGISTRY.length}`, color: verifiedSecrets === SECRET_REGISTRY.length ? "text-emerald-500" : "text-amber-500" },
            { label: "Open Gaps", value: String(totalGaps), color: totalGaps === 0 ? "text-emerald-500" : "text-amber-500" },
            { label: "Key Rotation", value: keyRotationDueSoon ? "Due soon" : "On schedule", color: keyRotationDueSoon ? "text-amber-500" : "text-emerald-500" },
          ].map(m => (
            <Card key={m.label}><CardContent className="p-4">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">{m.label}</p>
              <p className={`text-xl font-bold ${m.color}`}>{m.value}</p>
            </CardContent></Card>
          ))}
        </motion.div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="overview">Domain Posture</TabsTrigger>
            <TabsTrigger value="secrets">Secret Integrity</TabsTrigger>
            <TabsTrigger value="classification">Data Classification</TabsTrigger>
            <TabsTrigger value="rotation">Key Rotation</TabsTrigger>
            <TabsTrigger value="gaps">Protection Gaps</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 space-y-2">
            {posture.map((p) => (
              <div key={p.domain} className="p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {p.sensitiveData ? <Shield className="h-4 w-4 text-amber-500" /> : <Database className="h-4 w-4 text-muted-foreground" />}
                    <span className="text-sm font-medium text-foreground">{p.domain}</span>
                    {p.sensitiveData && <Badge variant="outline" className="text-[9px] bg-amber-500/10 text-amber-500 border-amber-500/20">Sensitive</Badge>}
                  </div>
                  <span className="text-[10px] text-muted-foreground">Verified {new Date(p.lastVerified).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className={`text-[9px] ${ENCRYPTION_BADGE[p.encryption]}`}>Encryption: {p.encryption}</Badge>
                  <Badge variant="outline" className={`text-[9px] ${p.rlsEnabled ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" : "text-red-500 bg-red-500/10 border-red-500/20"}`}>RLS: {p.rlsEnabled ? "enabled" : "disabled"}</Badge>
                  <Badge variant="outline" className={`text-[9px] ${SECRET_BADGE[p.secretsIntegrity]}`}>Secrets: {p.secretsIntegrity}</Badge>
                </div>
                {p.gaps.length > 0 && (
                  <div className="mt-2 space-y-1">{p.gaps.map((g, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-[10px] text-amber-500"><AlertTriangle className="h-3 w-3" /> {g}</div>
                  ))}</div>
                )}
              </div>
            ))}
          </TabsContent>

          <TabsContent value="secrets" className="mt-4">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold flex items-center gap-2"><Key className="h-4 w-4 text-primary" /> Secret Integrity Matrix</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {SECRET_REGISTRY.map(s => (
                  <div key={s.name} className="p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Key className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground font-mono">{s.name}</span>
                        <Badge variant="outline" className={`text-[9px] ${SECRET_BADGE[s.status]}`}>{s.status}</Badge>
                      </div>
                      <Badge variant="secondary" className="text-[9px]">{s.scope}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                      <span>Rotated: {s.rotatedAt}</span>
                      <span>Expires: {s.expiresAt}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="classification" className="mt-4">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold flex items-center gap-2"><Fingerprint className="h-4 w-4 text-primary" /> Data Classification Board</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {CLASSIFICATION_MATRIX.map(c => (
                  <div key={c.domain} className="p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">{c.domain}</span>
                        <Badge variant="outline" className={`text-[9px] ${c.classification === "PHI" ? "bg-red-500/10 text-red-500 border-red-500/20" : c.classification === "PII" || c.classification === "Sensitive" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-blue-500/10 text-blue-500 border-blue-500/20"}`}>{c.classification}</Badge>
                      </div>
                      <Badge variant="secondary" className="text-[9px]">{c.protectionLevel}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                      <span>Tables: {c.tables.map(t => <span key={t} className="font-mono text-foreground mr-1">{t}</span>)}</span>
                      <span>Last audit: {c.lastAudit}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rotation" className="mt-4">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> Key Rotation Schedule</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {KEY_ROTATION_SCHEDULE.map(k => (
                  <div key={k.key} className="p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">{k.key}</span>
                      <Badge variant="outline" className={`text-[9px] ${k.status === "on-schedule" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"}`}>{k.status === "on-schedule" ? "On Schedule" : "Due Soon"}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                      <span>Last rotated: {k.lastRotated}</span>
                      <span>Next rotation: <span className={k.status === "due-soon" ? "text-amber-500 font-medium" : "text-foreground"}>{k.nextRotation}</span></span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gaps" className="mt-4">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-500" /> Protection Gaps ({totalGaps})</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {posture.filter(p => p.gaps.length > 0).map(p => (
                  <div key={p.domain} className="p-3 rounded-lg border border-amber-500/20 bg-amber-500/5">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4 text-amber-500" />
                      <span className="text-sm font-medium text-foreground">{p.domain}</span>
                    </div>
                    {p.gaps.map((g, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-[10px] text-amber-500 mb-1">
                        <XCircle className="h-3 w-3" /> {g}
                      </div>
                    ))}
                  </div>
                ))}
                {totalGaps === 0 && (
                  <div className="text-center py-6 text-xs text-muted-foreground"><CheckCircle className="h-8 w-8 mx-auto mb-2 text-emerald-500/50" />No protection gaps detected</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default SecurityPostureBoard;
