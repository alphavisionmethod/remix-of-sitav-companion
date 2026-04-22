import { motion } from "framer-motion";
import { Wrench, CheckCircle, AlertTriangle, Shield, Eye, Play, Clock, ArrowRight, Sparkles, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import DPOSubNav from "./DPOSubNav";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
type PatchStatus = "pending" | "approved" | "applied" | "rejected" | "verified";

interface Patch {
  id: string;
  issue: string;
  page: string;
  fixPlan: string;
  confidence: number;
  severity: "critical" | "high" | "medium" | "low";
  autoFixEligible: boolean;
  status: PatchStatus;
  beforeSnippet: string;
  afterSnippet: string;
  detectedBy: string;
  verifiedAfterApply: boolean;
  affectedPages: string[];
}

const INITIAL_PATCHES: Patch[] = [
  { id: "p1", issue: "Broken link to /resources/guide", page: "/blog/old-post", fixPlan: "Update href to /resources/updated-guide", confidence: 95, severity: "high", autoFixEligible: true, status: "pending", beforeSnippet: '<a href="/resources/guide">', afterSnippet: '<a href="/resources/updated-guide">', detectedBy: "Technical QA", verifiedAfterApply: false, affectedPages: ["/blog/old-post"] },
  { id: "p2", issue: "Missing meta description", page: "/about", fixPlan: "Generate meta description from page content", confidence: 88, severity: "medium", autoFixEligible: true, status: "pending", beforeSnippet: "<meta name=\"description\" content=\"\">", afterSnippet: "<meta name=\"description\" content=\"Learn about our mission, team, and values.\">", detectedBy: "SEO Advisor", verifiedAfterApply: false, affectedPages: ["/about"] },
  { id: "p3", issue: "Expired summer sale banner still live", page: "/", fixPlan: "Remove banner component, replace with default hero", confidence: 92, severity: "high", autoFixEligible: true, status: "pending", beforeSnippet: "<Banner promo=\"summer-sale\" />", afterSnippet: "<Hero variant=\"default\" />", detectedBy: "Promotions Advisor", verifiedAfterApply: false, affectedPages: ["/", "/shop"] },
  { id: "p4", issue: "Trust badges missing on checkout", page: "/checkout", fixPlan: "Add SSL + payment trust badges near CTA", confidence: 90, severity: "critical", autoFixEligible: false, status: "pending", beforeSnippet: "<CheckoutForm />", afterSnippet: "<CheckoutForm />\n<TrustBadges />", detectedBy: "CRO Advisor", verifiedAfterApply: false, affectedPages: ["/checkout"] },
  { id: "p5", issue: "Image not optimized (2.4MB)", page: "/services", fixPlan: "Compress hero image from 2.4MB to ~180KB", confidence: 99, severity: "low", autoFixEligible: true, status: "applied", beforeSnippet: "hero.png (2.4MB)", afterSnippet: "hero.webp (182KB)", detectedBy: "Technical QA", verifiedAfterApply: true, affectedPages: ["/services"] },
  { id: "p6", issue: "Contact form 404 on mobile", page: "/contact", fixPlan: "Fix mobile route handler for form submission", confidence: 82, severity: "critical", autoFixEligible: false, status: "pending", beforeSnippet: "POST /api/contact → 404", afterSnippet: "POST /api/contact → 200", detectedBy: "Technical QA", verifiedAfterApply: false, affectedPages: ["/contact"] },
];

export default function SelfHealingQueue() {
  const [patches, setPatches] = useState(INITIAL_PATCHES);

  const updateStatus = (id: string, status: PatchStatus) => {
    setPatches(prev => prev.map(p => p.id === id ? { ...p, status, verifiedAfterApply: status === "applied" ? false : p.verifiedAfterApply } : p));
  };

  const verify = (id: string) => {
    setPatches(prev => prev.map(p => p.id === id ? { ...p, verifiedAfterApply: true } : p));
  };

  const sevColor = (s: string) => s === "critical" ? "text-red-400" : s === "high" ? "text-amber-400" : s === "medium" ? "text-yellow-400" : "text-muted-foreground";

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <DPOSubNav />
<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">Self-Healing Queue / Patch Center</h1>
        <p className="text-sm text-muted-foreground">Manage safe automatic or drafted fixes with preview, approval & verification</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {([] as typeof DEMO_STATS).map(s => (
          <Card key={s.label} className="bg-card/50 border-border/50">
            <CardContent className="p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Patch Queue */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2"><Wrench className="w-4 h-4 text-primary" /> Patch Queue</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {patches.map(p => (
            <motion.div key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-muted/30 rounded-lg border border-border/30">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-bold ${sevColor(p.severity)}`}>{p.severity.toUpperCase()}</span>
                    <span className="text-sm font-medium text-foreground">{p.issue}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span className="font-mono">{p.page}</span>
                    <span>·</span>
                    <span>Detected by {p.detectedBy}</span>
                    <span>·</span>
                    <span>{p.affectedPages.length} page(s) affected</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={p.status === "applied" ? "default" : p.status === "rejected" ? "destructive" : "secondary"} className="text-[10px]">{p.status}</Badge>
                  {p.autoFixEligible && p.status === "pending" && (
                    <Badge variant="default" className="text-[10px] bg-green-500/20 text-green-400 border-green-500/30">
                      <Shield className="w-3 h-3 mr-1" /> Auto-fix safe
                    </Badge>
                  )}
                </div>
              </div>

              {/* Fix Plan */}
              <div className="mb-2">
                <p className="text-[10px] text-muted-foreground mb-1">Fix plan:</p>
                <p className="text-xs text-foreground">{p.fixPlan}</p>
              </div>

              {/* Before / After Diff */}
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div className="p-2 bg-red-500/5 rounded border border-red-500/10">
                  <p className="text-[10px] text-red-400 mb-0.5">Before</p>
                  <code className="text-[10px] text-muted-foreground font-mono break-all">{p.beforeSnippet}</code>
                </div>
                <div className="p-2 bg-green-500/5 rounded border border-green-500/10">
                  <p className="text-[10px] text-green-400 mb-0.5">After</p>
                  <code className="text-[10px] text-foreground font-mono break-all">{p.afterSnippet}</code>
                </div>
              </div>

              {/* Confidence */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] text-muted-foreground">Confidence:</span>
                <div className="w-20"><Progress value={p.confidence} className="h-1.5" /></div>
                <span className={`text-[10px] font-bold ${p.confidence >= 90 ? "text-green-400" : p.confidence >= 75 ? "text-amber-400" : "text-red-400"}`}>{p.confidence}%</span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {p.status === "pending" && (
                  <>
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => updateStatus(p.id, "approved")}>
                      <CheckCircle className="w-3 h-3 mr-1" /> Approve
                    </Button>
                    {p.autoFixEligible && (
                      <Button size="sm" className="h-7 text-xs" onClick={() => updateStatus(p.id, "applied")}>
                        <Play className="w-3 h-3 mr-1" /> Auto-Apply
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => updateStatus(p.id, "rejected")}>
                      Reject
                    </Button>
                  </>
                )}
                {p.status === "approved" && (
                  <Button size="sm" className="h-7 text-xs" onClick={() => updateStatus(p.id, "applied")}>
                    <Play className="w-3 h-3 mr-1" /> Apply Now
                  </Button>
                )}
                {p.status === "applied" && !p.verifiedAfterApply && (
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => verify(p.id)}>
                    <Eye className="w-3 h-3 mr-1" /> Verify Fix
                  </Button>
                )}
                {p.status === "applied" && p.verifiedAfterApply && (
                  <Badge variant="default" className="text-[10px]"><CheckCircle className="w-3 h-3 mr-1" /> Verified Clean</Badge>
                )}
                {p.status === "applied" && (
                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => updateStatus(p.id, "pending")}>
                    <RotateCcw className="w-3 h-3 mr-1" /> Rollback
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
