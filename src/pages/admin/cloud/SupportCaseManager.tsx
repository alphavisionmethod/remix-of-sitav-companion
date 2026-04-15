// ═══════════════════════════════════════════════════════════════
// SITA OS — Support Case Manager
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supportWorkflow, type SupportCase, type SupportCaseEvent } from "@/lib/platform-plane";
import { LifeBuoy, ArrowUpRight, Clock, CheckCircle2, MessageSquare, AlertCircle } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  open: "bg-primary/20 text-primary",
  investigating: "bg-amber-500/20 text-amber-400",
  escalated: "bg-destructive/20 text-destructive",
  waiting_user: "bg-muted text-muted-foreground",
  resolved: "bg-green-500/20 text-green-400",
  closed: "bg-muted text-muted-foreground",
};

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  normal: "bg-primary/20 text-primary",
  high: "bg-orange-500/20 text-orange-400",
  urgent: "bg-destructive/20 text-destructive",
};

export function SupportCaseManager() {
  const [cases, setCases] = useState<SupportCase[]>([]);
  const [selectedCase, setSelectedCase] = useState<SupportCase | null>(null);
  const [events, setEvents] = useState<SupportCaseEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supportWorkflow.getAllCases().then((c) => {
      setCases(c);
      setLoading(false);
    });
  }, []);

  const loadEvents = async (c: SupportCase) => {
    setSelectedCase(c);
    const evts = await supportWorkflow.getCaseEvents(c.id);
    setEvents(evts);
  };

  const openCases = cases.filter((c) => !["resolved", "closed"].includes(c.status));
  const resolvedCases = cases.filter((c) => ["resolved", "closed"].includes(c.status));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-primary/20 flex items-center justify-center">
          <LifeBuoy className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Support Case Manager</h2>
          <p className="text-sm text-muted-foreground">Structured support workflow with escalation and diagnostics</p>
        </div>
        <div className="ml-auto flex gap-2">
          <Badge variant="outline">{openCases.length} open</Badge>
          <Badge variant="secondary">{resolvedCases.length} resolved</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Case List */}
        <div className="lg:col-span-2">
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Cases</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-muted-foreground text-sm">Loading…</div>
              ) : cases.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <LifeBuoy className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No support cases yet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cases.map((c) => (
                      <TableRow key={c.id} className={selectedCase?.id === c.id ? "bg-muted/30" : ""}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-sm">{c.title}</div>
                            <div className="text-[10px] font-mono text-muted-foreground">{c.correlationId ?? c.id.slice(0, 8)}</div>
                          </div>
                        </TableCell>
                        <TableCell><Badge variant="secondary" className="text-[10px]">{c.category}</Badge></TableCell>
                        <TableCell>
                          <Badge className={`text-[10px] ${PRIORITY_COLORS[c.priority] ?? ""}`}>{c.priority}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`text-[10px] ${STATUS_COLORS[c.status] ?? ""}`}>{c.status}</Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(c.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => loadEvents(c)}>
                            <MessageSquare className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Case Detail */}
        <div>
          {selectedCase ? (
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{selectedCase.title}</CardTitle>
                <CardDescription>{selectedCase.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-muted-foreground">Status</div>
                  <div><Badge className={`text-[10px] ${STATUS_COLORS[selectedCase.status] ?? ""}`}>{selectedCase.status}</Badge></div>
                  <div className="text-muted-foreground">Priority</div>
                  <div><Badge className={`text-[10px] ${PRIORITY_COLORS[selectedCase.priority] ?? ""}`}>{selectedCase.priority}</Badge></div>
                  <div className="text-muted-foreground">Self-repair</div>
                  <div>{selectedCase.selfRepairAttempted ? "Attempted" : "Not tried"}</div>
                  {selectedCase.escalatedToRole && (
                    <>
                      <div className="text-muted-foreground">Escalated to</div>
                      <div className="flex items-center gap-1"><ArrowUpRight className="h-3 w-3 text-destructive" />{selectedCase.escalatedToRole}</div>
                    </>
                  )}
                  {selectedCase.resolution && (
                    <>
                      <div className="text-muted-foreground">Resolution</div>
                      <div className="col-span-2 text-sm">{selectedCase.resolution}</div>
                    </>
                  )}
                </div>

                {/* Timeline */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Timeline</h4>
                  {events.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No events</p>
                  ) : (
                    <div className="space-y-1.5">
                      {events.map((e) => (
                        <div key={e.id} className="flex gap-2 items-start text-xs">
                          <div className="mt-0.5">
                            {e.eventType === "created" && <AlertCircle className="h-3 w-3 text-primary" />}
                            {e.eventType === "escalated" && <ArrowUpRight className="h-3 w-3 text-destructive" />}
                            {e.eventType === "resolved" && <CheckCircle2 className="h-3 w-3 text-green-400" />}
                            {!["created", "escalated", "resolved"].includes(e.eventType) && <Clock className="h-3 w-3 text-muted-foreground" />}
                          </div>
                          <div className="flex-1">
                            <div className="text-foreground">{e.content}</div>
                            <div className="text-[10px] text-muted-foreground">{new Date(e.createdAt).toLocaleString()}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-card/50 border-border/50">
              <CardContent className="py-12 text-center text-muted-foreground">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">Select a case to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
