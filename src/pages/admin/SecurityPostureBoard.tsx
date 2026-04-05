import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Lock, Shield, CheckCircle, AlertTriangle, XCircle, Eye, RefreshCw, Key, Database, Server } from "lucide-react";

const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

interface PostureItem {
  domain: string;
  encryption: "full" | "partial" | "none";
  rlsEnabled: boolean;
  secretsIntegrity: "verified" | "unverified" | "expired";
  sensitiveData: boolean;
  lastVerified: string;
  gaps: string[];
}

const POSTURE: PostureItem[] = [
  { domain: "User Auth & Profiles", encryption: "full", rlsEnabled: true, secretsIntegrity: "verified", sensitiveData: true, lastVerified: "2026-04-05T08:00:00Z", gaps: [] },
  { domain: "Financial Data", encryption: "full", rlsEnabled: true, secretsIntegrity: "verified", sensitiveData: true, lastVerified: "2026-04-05T07:30:00Z", gaps: [] },
  { domain: "Connector Credentials", encryption: "full", rlsEnabled: true, secretsIntegrity: "verified", sensitiveData: true, lastVerified: "2026-04-05T09:00:00Z", gaps: [] },
  { domain: "Audit Logs", encryption: "full", rlsEnabled: true, secretsIntegrity: "verified", sensitiveData: false, lastVerified: "2026-04-05T08:15:00Z", gaps: [] },
  { domain: "Workflow State", encryption: "partial", rlsEnabled: true, secretsIntegrity: "verified", sensitiveData: false, lastVerified: "2026-04-04T22:00:00Z", gaps: ["Event payloads not encrypted at rest"] },
  { domain: "Device Fleet", encryption: "full", rlsEnabled: true, secretsIntegrity: "unverified", sensitiveData: false, lastVerified: "2026-04-03T12:00:00Z", gaps: ["Secret rotation overdue"] },
];

const encColor = { full: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", partial: "text-amber-500 bg-amber-500/10 border-amber-500/20", none: "text-red-500 bg-red-500/10 border-red-500/20" };
const secColor = { verified: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", unverified: "text-amber-500 bg-amber-500/10 border-amber-500/20", expired: "text-red-500 bg-red-500/10 border-red-500/20" };

const SecurityPostureBoard = () => {
  const fullEncryption = POSTURE.filter(p => p.encryption === "full").length;
  const allRls = POSTURE.filter(p => p.rlsEnabled).length;
  const totalGaps = POSTURE.reduce((s, p) => s + p.gaps.length, 0);

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Lock className="h-6 w-6 text-primary" /> Data Protection Posture
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Security and data protection truth by domain</p>
        </div>
        <Button variant="outline" size="sm"><RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Verify All</Button>
      </div>

      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
        <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {[
            { label: "Encryption Coverage", value: `${fullEncryption}/${POSTURE.length}`, pct: Math.round((fullEncryption / POSTURE.length) * 100), color: fullEncryption === POSTURE.length ? "text-emerald-500" : "text-amber-500" },
            { label: "RLS Enabled", value: `${allRls}/${POSTURE.length}`, pct: Math.round((allRls / POSTURE.length) * 100), color: allRls === POSTURE.length ? "text-emerald-500" : "text-red-500" },
            { label: "Secrets Verified", value: `${POSTURE.filter(p => p.secretsIntegrity === "verified").length}/${POSTURE.length}`, pct: Math.round((POSTURE.filter(p => p.secretsIntegrity === "verified").length / POSTURE.length) * 100), color: "text-emerald-500" },
            { label: "Open Gaps", value: String(totalGaps), color: totalGaps === 0 ? "text-emerald-500" : "text-amber-500" },
          ].map(m => (
            <Card key={m.label}>
              <CardContent className="p-4">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">{m.label}</p>
                <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
                {m.pct != null && <Progress value={m.pct} className="mt-2 h-1.5" />}
              </CardContent>
            </Card>
          ))}
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Domain Security Posture</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {POSTURE.map((p) => (
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
                    <Badge variant="outline" className={`text-[9px] ${encColor[p.encryption]}`}>Encryption: {p.encryption}</Badge>
                    <Badge variant="outline" className={`text-[9px] ${p.rlsEnabled ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" : "text-red-500 bg-red-500/10 border-red-500/20"}`}>RLS: {p.rlsEnabled ? "enabled" : "disabled"}</Badge>
                    <Badge variant="outline" className={`text-[9px] ${secColor[p.secretsIntegrity]}`}>Secrets: {p.secretsIntegrity}</Badge>
                  </div>
                  {p.gaps.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {p.gaps.map((g, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-[10px] text-amber-500">
                          <AlertTriangle className="h-3 w-3" /> {g}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SecurityPostureBoard;
