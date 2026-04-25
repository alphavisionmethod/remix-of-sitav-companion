// ═══════════════════════════════════════════════════════════════
// SITA OS — SRE07: Version Intelligence Board
// Change history, regression correlation, suspect commits
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { motion } from "framer-motion";
import { AdminPageHeader } from "@/platform/sita/components/sita/admin/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  GitCommit, GitBranch, AlertTriangle, CheckCircle2, User, Bot,
  TestTube, Rocket, Link2, RotateCcw, Activity, Search
} from "lucide-react";
import { getVersionCommits, type VersionCommit } from "@/lib/services/engineering-governance";

export default function SRE07VersionIntelligence() {
  const [commits] = useState<VersionCommit[]>(getVersionCommits);

  const agentAuthored = commits.filter(c => c.author_type === "agent").length;
  const humanAuthored = commits.filter(c => c.author_type === "human").length;
  const avgSuspect = commits.reduce((s, c) => s + c.suspect_score, 0) / commits.length;
  const totalTests = commits.reduce((s, c) => s + c.tests_added, 0);

  return (
    <div className="space-y-6 p-6">
      <AdminPageHeader
        icon={GitCommit}
        title="Version Intelligence Board"
        subtitle="Understand change history as causal input — confidence-ranked suspect commits"
        accent="primary"
      />

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Commits", value: commits.length, icon: GitCommit, color: "text-primary" },
          { label: "Agent / Human", value: `${agentAuthored} / ${humanAuthored}`, icon: Bot, color: "text-purple-400" },
          { label: "Tests Added", value: totalTests, icon: TestTube, color: "text-trust-safe" },
          { label: "Avg Suspect Score", value: `${(avgSuspect * 100).toFixed(0)}%`, icon: Search, color: avgSuspect > 0.5 ? "text-amber-400" : "text-trust-safe" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}>
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <s.icon className={`h-5 w-5 ${s.color} shrink-0`} />
                <div>
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Commit List */}
      <div className="space-y-3">
        {commits.sort((a, b) => b.suspect_score - a.suspect_score).map((commit, i) => (
          <motion.div key={commit.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.05 }}>
            <Card className={`border-border/50 bg-card/80 ${commit.suspect_score > 0.5 ? "border-amber-500/30" : ""}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-xl shrink-0 ${
                    commit.suspect_score > 0.6 ? "bg-amber-500/10" : commit.suspect_score > 0.3 ? "bg-blue-500/10" : "bg-muted/40"
                  }`}>
                    <GitCommit className={`h-5 w-5 ${
                      commit.suspect_score > 0.6 ? "text-amber-400" : commit.suspect_score > 0.3 ? "text-blue-400" : "text-muted-foreground"
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <code className="text-xs font-mono text-primary">{commit.sha}</code>
                        <p className="text-sm font-medium text-foreground">{commit.message}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        {commit.author_type === "agent" ? <Bot className="h-3 w-3 text-purple-400" /> : <User className="h-3 w-3 text-blue-400" />}
                        {commit.author_name}
                      </span>
                      <span className="flex items-center gap-1"><TestTube className="h-3 w-3" />+{commit.tests_added} tests</span>
                      <span className="flex items-center gap-1"><Rocket className="h-3 w-3" />{commit.rollout_target}</span>
                      <span>{new Date(commit.created_at).toLocaleString()}</span>
                    </div>

                    {/* Affected Systems */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {commit.affected_systems.map(sys => (
                        <Badge key={sys} variant="outline" className="text-[10px] h-4">{sys}</Badge>
                      ))}
                    </div>

                    {/* Links */}
                    <div className="flex items-center gap-3 flex-wrap">
                      {commit.incident_links.length > 0 && commit.incident_links.map(link => (
                        <Badge key={link} variant="destructive" className="text-[10px] h-4 gap-0.5"><AlertTriangle className="h-2.5 w-2.5" />{link}</Badge>
                      ))}
                      {commit.regression_links.length > 0 && commit.regression_links.map(link => (
                        <Badge key={link} variant="secondary" className="text-[10px] h-4 gap-0.5"><Link2 className="h-2.5 w-2.5" />{link}</Badge>
                      ))}
                      {commit.rollback_links.length > 0 && commit.rollback_links.map(link => (
                        <Badge key={link} variant="outline" className="text-[10px] h-4 gap-0.5 text-orange-400 border-orange-500/30"><RotateCcw className="h-2.5 w-2.5" />{link}</Badge>
                      ))}
                    </div>

                    {/* Suspect Score */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground">Suspect Score:</span>
                      <Progress value={commit.suspect_score * 100} className={`h-1.5 flex-1 max-w-32 ${commit.suspect_score > 0.5 ? "[&>div]:bg-amber-500" : commit.suspect_score > 0.3 ? "[&>div]:bg-blue-500" : ""}`} />
                      <span className={`text-xs font-mono ${commit.suspect_score > 0.5 ? "text-amber-400" : "text-muted-foreground"}`}>
                        {(commit.suspect_score * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
