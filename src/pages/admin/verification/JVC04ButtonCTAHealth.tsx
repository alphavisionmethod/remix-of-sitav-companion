// ═══════════════════════════════════════════════════════
// SITA OS — JVC04: Button & CTA Health Board
// Clickability, disabled-state, destinations, ghost buttons
// ═══════════════════════════════════════════════════════

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useVerificationSurfaces, useVerificationRuns } from "@/lib/verification/verification-hooks";
import { SURFACE_REGISTRY, type SurfaceEntry } from "@/lib/verification/surface-registry";
import {
  MousePointerClick, AlertTriangle, Shield, Search, CheckCircle2, XCircle, Ghost, Target, Zap
} from "lucide-react";

const CTA_CLASSES = new Set(["button", "card_action", "form", "toggle", "upload", "ai_input"]);

function isCTA(s: SurfaceEntry) {
  return CTA_CLASSES.has(s.surfaceClass);
}

export default function JVC04ButtonCTAHealth() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");
  const { data: dbSurfaces } = useVerificationSurfaces();
  const { data: runs } = useVerificationRuns();

  const allCTAs = useMemo(() => SURFACE_REGISTRY.filter(isCTA), []);
  const surfaceMap = useMemo(() => {
    const m = new Map<string, Record<string, any>>();
    (dbSurfaces || []).forEach((s: Record<string, any>) => m.set(s.route_key, s));
    return m;
  }, [dbSurfaces]);

  // Run counts per surface
  const runCountMap = useMemo(() => {
    const m = new Map<string, number>();
    (runs || []).forEach((r: Record<string, any>) => {
      const key = r.surface_id;
      m.set(key, (m.get(key) || 0) + 1);
    });
    return m;
  }, [runs]);

  // KPIs
  const p0CTAs = allCTAs.filter((c) => c.testPriority === "P0");
  const withSelectors = allCTAs.filter((c) => !!c.actionSelector);
  const withoutSelectors = allCTAs.filter((c) => !c.actionSelector);
  const withRedirects = allCTAs.filter((c) => !!c.redirectTarget);
  const withProofRequired = allCTAs.filter((c) => c.proofReceiptRequired);
  const staleSelectors = allCTAs.filter(
    (c) => c.actionSelector && !c.actionSelector.includes("data-testid")
  );
  const ghostButtons = allCTAs.filter((c) => !c.actionSelector && c.testPriority === "P0");
  const duplicateSubmitRisk = allCTAs.filter(
    (c) =>
      c.surfaceClass === "form" &&
      c.expectedPersistence &&
      !c.proofReceiptRequired
  );

  // Verified status from DB
  const verifiedCTAs = allCTAs.filter((c) => {
    const db = surfaceMap.get(c.routeKey);
    return db?.verification_status === "pass";
  });
  const failedCTAs = allCTAs.filter((c) => {
    const db = surfaceMap.get(c.routeKey);
    return db?.verification_status === "fail";
  });

  // Filtered list
  const filtered = useMemo(() => {
    let list = allCTAs;
    if (tab === "ghost") list = ghostButtons;
    else if (tab === "stale") list = staleSelectors;
    else if (tab === "risk") list = duplicateSubmitRisk;
    else if (tab === "p0") list = p0CTAs;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.routeKey.toLowerCase().includes(q) ||
          c.actionLabel.toLowerCase().includes(q) ||
          c.domain.toLowerCase().includes(q)
      );
    }
    return list;
  }, [allCTAs, tab, search, ghostButtons, staleSelectors, duplicateSubmitRisk, p0CTAs]);

  const coveragePct = allCTAs.length > 0 ? Math.round((verifiedCTAs.length / allCTAs.length) * 100) : 0;

  return (
    <div className="space-y-6 p-6" data-testid="jvc04-button-cta-health">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MousePointerClick className="h-6 w-6 text-primary" />
          JVC04 — Button & CTA Health Board
        </h1>
        <p className="text-muted-foreground mt-1">
          Clickability, disabled-state correctness, destinations, duplicate submit risks, ghost detection
        </p>
      </div>

      {/* KPI Band */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <Card><CardContent className="p-3 text-center">
          <div className="text-2xl font-bold text-primary">{allCTAs.length}</div>
          <div className="text-[10px] text-muted-foreground">Total CTAs</div>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <div className="text-2xl font-bold text-amber-500">{p0CTAs.length}</div>
          <div className="text-[10px] text-muted-foreground">P0 CTAs</div>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <div className="text-2xl font-bold text-green-500">{withSelectors.length}</div>
          <div className="text-[10px] text-muted-foreground">With Selectors</div>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <div className="text-2xl font-bold text-destructive">{withoutSelectors.length}</div>
          <div className="text-[10px] text-muted-foreground">No Selectors</div>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <div className="text-2xl font-bold text-blue-500">{withRedirects.length}</div>
          <div className="text-[10px] text-muted-foreground">With Redirects</div>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <div className="text-2xl font-bold text-green-500">{verifiedCTAs.length}</div>
          <div className="text-[10px] text-muted-foreground">Verified Pass</div>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <div className="text-2xl font-bold text-destructive">{failedCTAs.length}</div>
          <div className="text-[10px] text-muted-foreground">Failed</div>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <div className="text-2xl font-bold">{coveragePct}%</div>
          <div className="text-[10px] text-muted-foreground">Coverage</div>
          <Progress value={coveragePct} className="mt-1 h-1" />
        </CardContent></Card>
      </div>

      {/* Risk Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={ghostButtons.length > 0 ? "border-destructive/50" : "border-green-500/30"}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Ghost className="h-5 w-5 text-destructive" />
              <h3 className="font-semibold text-sm">Ghost Buttons</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              P0 CTAs with no actionSelector — cannot be automated
            </p>
            {ghostButtons.length === 0 ? (
              <Badge variant="default" className="text-xs"><CheckCircle2 className="h-3 w-3 mr-1" />None detected</Badge>
            ) : (
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {ghostButtons.map((g) => (
                  <div key={g.routeKey} className="text-xs flex items-center gap-1 text-destructive">
                    <XCircle className="h-3 w-3 shrink-0" />
                    <span className="font-mono truncate">{g.routeKey}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className={staleSelectors.length > 0 ? "border-amber-500/50" : "border-green-500/30"}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <h3 className="font-semibold text-sm">Stale Selectors</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              CTAs using selectors without data-testid pattern
            </p>
            {staleSelectors.length === 0 ? (
              <Badge variant="default" className="text-xs"><CheckCircle2 className="h-3 w-3 mr-1" />All use data-testid</Badge>
            ) : (
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {staleSelectors.map((s) => (
                  <div key={s.routeKey} className="text-xs flex items-center gap-1 text-amber-500">
                    <AlertTriangle className="h-3 w-3 shrink-0" />
                    <span className="font-mono truncate">{s.actionSelector}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className={duplicateSubmitRisk.length > 0 ? "border-destructive/50" : "border-green-500/30"}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-destructive" />
              <h3 className="font-semibold text-sm">Duplicate Submit Risk</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              Persistent forms without proof/receipt guards
            </p>
            {duplicateSubmitRisk.length === 0 ? (
              <Badge variant="default" className="text-xs"><CheckCircle2 className="h-3 w-3 mr-1" />All guarded</Badge>
            ) : (
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {duplicateSubmitRisk.map((d) => (
                  <div key={d.routeKey} className="text-xs flex items-center gap-1 text-destructive">
                    <Zap className="h-3 w-3 shrink-0" />
                    <span className="font-mono truncate">{d.routeKey}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Clickability Matrix */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Clickability Matrix
            </h3>
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search CTAs..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-9"
                />
              </div>
            </div>
          </div>

          <Tabs value={tab} onValueChange={setTab} className="mb-3">
            <TabsList>
              <TabsTrigger value="all">All ({allCTAs.length})</TabsTrigger>
              <TabsTrigger value="p0">P0 ({p0CTAs.length})</TabsTrigger>
              <TabsTrigger value="ghost">Ghost ({ghostButtons.length})</TabsTrigger>
              <TabsTrigger value="stale">Stale ({staleSelectors.length})</TabsTrigger>
              <TabsTrigger value="risk">Submit Risk ({duplicateSubmitRisk.length})</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="max-h-[500px] overflow-y-auto border rounded">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Route Key</TableHead>
                  <TableHead className="text-xs">Label</TableHead>
                  <TableHead className="text-xs">Type</TableHead>
                  <TableHead className="text-xs">Action</TableHead>
                  <TableHead className="text-xs">Selector</TableHead>
                  <TableHead className="text-xs">Destination</TableHead>
                  <TableHead className="text-xs">Priority</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((cta) => {
                  const db = surfaceMap.get(cta.routeKey);
                  const status = db?.verification_status || "untested";
                  return (
                    <TableRow key={cta.routeKey}>
                      <TableCell className="font-mono text-xs">{cta.routeKey}</TableCell>
                      <TableCell className="text-xs">{cta.actionLabel}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">{cta.surfaceClass}</Badge>
                      </TableCell>
                      <TableCell className="text-xs">{cta.actionType}</TableCell>
                      <TableCell className="text-xs font-mono max-w-[150px] truncate">
                        {cta.actionSelector ? (
                          <span className={cta.actionSelector.includes("data-testid") ? "text-green-500" : "text-amber-500"}>
                            {cta.actionSelector}
                          </span>
                        ) : (
                          <span className="text-destructive italic">none</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs font-mono">
                        {cta.redirectTarget || <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={cta.testPriority === "P0" ? "destructive" : cta.testPriority === "P1" ? "default" : "secondary"}
                          className="text-[10px]"
                        >
                          {cta.testPriority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={status === "pass" ? "default" : status === "fail" ? "destructive" : "secondary"}
                          className="text-[10px]"
                        >
                          {status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            Showing {filtered.length} of {allCTAs.length} CTAs
          </div>
        </CardContent>
      </Card>

      {/* Proof/Receipt Requirements */}
      {withProofRequired.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              CTAs Requiring Proof/Receipt
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {withProofRequired.map((c) => {
                const db = surfaceMap.get(c.routeKey);
                const status = db?.verification_status || "untested";
                return (
                  <div key={c.routeKey} className="flex items-center gap-2 text-xs p-2 bg-muted/30 rounded">
                    {status === "pass" ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <AlertTriangle className="h-3 w-3 text-amber-500" />}
                    <span className="font-mono">{c.routeKey}</span>
                    <span className="text-muted-foreground ml-auto">{c.actionLabel}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
