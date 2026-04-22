import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Shield, AlertTriangle, CheckCircle, Lock, Eye, TrendingUp,
  Search, XCircle, Key, Activity, BarChart3, RefreshCw
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };

const TRUST_METRICS = {
  threatLevel: "low",
  trustScore: 94,
  trustTrend: "+2.1",
  suspiciousEvents24h: 3,
  blockedActions: 12,
  criticalFindings: 0,
  policyViolations: 1,
  keyRotationDue: 2,
};

const SECURITY_FINDINGS = [
  { id: "sf1", severity: "medium", title: "Trust prompt false-positive rate above threshold", domain: "trust", status: "open", detail: "12.4% of trust prompts shown to verified users were unnecessary" },
  { id: "sf2", severity: "low", title: "API key rotation overdue for 2 connector keys", domain: "connectors", status: "open", detail: "Slack and Google connectors have keys older than 90 days" },
  { id: "sf3", severity: "low", title: "Agent safety violation: budget exceeded without escalation", domain: "ai", status: "resolved", detail: "Finance advisor exceeded token budget by 15%, auto-paused" },
];

const TRUST_TRENDS = [
  { period: "7d ago", score: 91 },
  { period: "6d", score: 92 },
  { period: "5d", score: 91 },
  { period: "4d", score: 93 },
  { period: "3d", score: 92 },
  { period: "2d", score: 93 },
  { period: "1d", score: 94 },
  { period: "Now", score: 94 },
];

const threatColor: Record<string, string> = {
  low: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  medium: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  high: "text-red-400 bg-red-500/10 border-red-500/20",
  critical: "text-red-500 bg-red-500/15 border-red-500/30",
};

const MCTrustSecurity = () => {
  ;

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Trust & Security</h1>
          <p className="text-sm text-muted-foreground mt-1">Unified trust, risk, security, and policy oversight</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={`text-xs h-6 gap-1.5 px-3 ${threatColor[TRUST_METRICS.threatLevel]}`}>
            <Shield className="h-3 w-3" /> Threat Level: {TRUST_METRICS.threatLevel.toUpperCase()}
          </Badge>
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5"><RefreshCw className="h-3 w-3" /> Scan Now</Button>
        </div>
      </div>

      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
        {/* Metrics */}
        <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Trust Score", value: TRUST_METRICS.trustScore, sub: `${TRUST_METRICS.trustTrend} this week`, icon: Shield, color: "text-emerald-400" },
            { label: "Suspicious Events", value: TRUST_METRICS.suspiciousEvents24h, sub: "last 24h", icon: Eye, color: "text-amber-400" },
            { label: "Blocked Actions", value: TRUST_METRICS.blockedActions, sub: "this week", icon: XCircle, color: "text-muted-foreground" },
            { label: "Key Rotation Due", value: TRUST_METRICS.keyRotationDue, sub: "connectors", icon: Key, color: "text-amber-400" },
          ].map(m => (
            <Card key={m.label} className="hover:-translate-y-0.5 transition-transform">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <m.icon className={`h-4 w-4 ${m.color}`} />
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{m.label}</span>
                </div>
                <p className="text-xl font-bold text-foreground">{m.value}</p>
                <p className="text-[10px] text-muted-foreground">{m.sub}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Trust Trend */}
        <motion.div variants={fadeUp}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /> Trust Score Trend (7 days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 h-20">
                {TRUST_TRENDS.map((t, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full bg-primary/20 rounded-t relative" style={{ height: `${(t.score - 85) * 6}px` }}>
                      <div className="absolute -top-4 w-full text-center text-[9px] text-foreground font-medium">{t.score}</div>
                    </div>
                    <span className="text-[8px] text-muted-foreground">{t.period}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Security Findings */}
        <motion.div variants={fadeUp}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-400" /> Security Findings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {SECURITY_FINDINGS.map(finding => (
                <div key={finding.id} className="p-3 rounded-lg border border-border/10 bg-muted/5">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className={`text-[9px] h-4 ${finding.severity === "medium" ? "text-amber-400 border-amber-500/20" : "text-muted-foreground"}`}>
                      {finding.severity}
                    </Badge>
                    <span className="text-xs font-medium text-foreground">{finding.title}</span>
                    <Badge variant="outline" className={`text-[9px] h-4 ml-auto ${finding.status === "resolved" ? "text-emerald-400 border-emerald-500/20" : "text-amber-400 border-amber-500/20"}`}>
                      {finding.status}
                    </Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground pl-0">{finding.detail}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={fadeUp}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Quick Actions</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {[
                { label: "Run Full Security Scan", icon: Shield },
                { label: "Review Critical Findings", icon: AlertTriangle },
                { label: "Tighten Policy", icon: Lock },
                { label: "Simulate Lower Threshold", icon: BarChart3 },
                { label: "Freeze Risky Automation", icon: XCircle },
              ].map(a => (
                <Button key={a.label} variant="outline" size="sm" className="h-8 text-xs gap-1.5"><a.icon className="h-3 w-3" /> {a.label}</Button>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default MCTrustSecurity;
