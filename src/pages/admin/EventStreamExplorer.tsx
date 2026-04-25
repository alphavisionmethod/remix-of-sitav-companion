import { useState } from "react";
import CPSSubNav from "@/platform/admin/components/admin/CPSSubNav";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, Search, RotateCcw, AlertTriangle, Link2, Filter } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchPersistedEvents, fetchDeadLetters, getEventLineage, markEventReplayed, type PersistedEvent } from "@/data/persistence";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

const fade = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = { processed: "bg-emerald-500/20 text-emerald-400", failed: "bg-red-500/20 text-red-400", dead_letter: "bg-amber-500/20 text-amber-400", replayed: "bg-blue-500/20 text-blue-400", pending: "bg-muted text-muted-foreground" };
  return <Badge className={`text-[10px] ${colors[status] ?? colors.pending}`}>{status}</Badge>;
}

export default function EventStreamExplorer() {
  const [topicFilter, setTopicFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [correlationSearch, setCorrelationSearch] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<PersistedEvent | null>(null);

  const { data: events = [], refetch } = useQuery({
    queryKey: ["event-stream", topicFilter, statusFilter],
    queryFn: () => fetchPersistedEvents({
      topic: topicFilter || undefined,
      status: statusFilter !== "all" ? statusFilter as never : undefined,
      limit: 200,
    }),
    staleTime: 15000,
  });

  const { data: deadLetters = [] } = useQuery({ queryKey: ["event-dl"], queryFn: () => fetchDeadLetters(50), staleTime: 30000 });
  const { data: lineage = [] } = useQuery({
    queryKey: ["event-lineage", correlationSearch],
    queryFn: () => correlationSearch ? getEventLineage(correlationSearch) : Promise.resolve([]),
    enabled: !!correlationSearch,
  });

  const handleReplay = async (eventId: string) => {
    await markEventReplayed(eventId);
    refetch();
  };

  const uniqueTopics = [...new Set(events.map(e => e.topic))];

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <CPSSubNav />
<motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.04 } } }} className="space-y-4">
        <motion.div variants={fade} className="flex items-center gap-3">
          <Activity className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Event Stream Explorer</h1>
          <Badge>{events.length} events</Badge>
          {deadLetters.length > 0 && <Badge variant="destructive">{deadLetters.length} dead letters</Badge>}
        </motion.div>

        {/* Filters */}
        <motion.div variants={fade} className="flex flex-wrap gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="processed">Processed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="dead_letter">Dead Letter</SelectItem>
              <SelectItem value="replayed">Replayed</SelectItem>
            </SelectContent>
          </Select>
          <Input placeholder="Filter by topic..." value={topicFilter} onChange={e => setTopicFilter(e.target.value)} className="w-56" />
          <div className="flex items-center gap-2">
            <Link2 className="h-4 w-4 text-muted-foreground" />
            <Input placeholder="Correlation ID..." value={correlationSearch} onChange={e => setCorrelationSearch(e.target.value)} className="w-64" />
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}><RotateCcw className="h-3 w-3 mr-1" />Refresh</Button>
        </motion.div>

        {/* Correlation trace */}
        {lineage.length > 0 && (
          <motion.div variants={fade}>
            <Card className="border-blue-500/30 bg-blue-500/5">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Correlation Trace: {correlationSearch.slice(0, 12)}...</CardTitle></CardHeader>
              <CardContent className="space-y-1">
                {lineage.map((e, i) => (
                  <div key={e.id} className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground font-mono w-6">{i + 1}</span>
                    <Badge variant="outline" className="text-[10px]">{e.topic}</Badge>
                    <StatusBadge status={e.status} />
                    <span className="text-muted-foreground">{e.source}</span>
                    <span className="ml-auto text-muted-foreground">{new Date(e.created_at).toLocaleTimeString()}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Event Table */}
        <motion.div variants={fade}>
          <Card className="border-border/50 bg-card/50">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border/50 text-muted-foreground">
                      <th className="p-3 text-left">Topic</th>
                      <th className="p-3 text-left">Source</th>
                      <th className="p-3 text-left">Domain</th>
                      <th className="p-3 text-left">Status</th>
                      <th className="p-3 text-left">Correlation</th>
                      <th className="p-3 text-left">Time</th>
                      <th className="p-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.length === 0 && (
                      <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No events found</td></tr>
                    )}
                    {events.map(event => (
                      <tr key={event.id} className="border-b border-border/20 hover:bg-muted/30 cursor-pointer" onClick={() => setSelectedEvent(event)}>
                        <td className="p-3 font-mono">{event.topic}</td>
                        <td className="p-3 text-muted-foreground">{event.source}</td>
                        <td className="p-3"><Badge variant="outline" className="text-[10px]">{event.domain ?? "—"}</Badge></td>
                        <td className="p-3"><StatusBadge status={event.status} /></td>
                        <td className="p-3 font-mono text-muted-foreground">{event.correlation_id?.slice(0, 8) ?? "—"}</td>
                        <td className="p-3 text-muted-foreground">{new Date(event.created_at).toLocaleString()}</td>
                        <td className="p-3">
                          {event.status === "dead_letter" && (
                            <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={e => { e.stopPropagation(); handleReplay(event.id); }}>
                              <RotateCcw className="h-3 w-3 mr-1" />Replay
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Event Detail Drawer */}
        {selectedEvent && (
          <motion.div variants={fade}>
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Event Detail: {selectedEvent.topic}</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedEvent(null)}>✕</Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="text-muted-foreground">ID:</span> <span className="font-mono">{selectedEvent.id}</span></div>
                  <div><span className="text-muted-foreground">Source:</span> {selectedEvent.source}</div>
                  <div><span className="text-muted-foreground">Status:</span> <StatusBadge status={selectedEvent.status} /></div>
                  <div><span className="text-muted-foreground">Domain:</span> {selectedEvent.domain ?? "—"}</div>
                  <div><span className="text-muted-foreground">Correlation:</span> <span className="font-mono">{selectedEvent.correlation_id ?? "—"}</span></div>
                  <div><span className="text-muted-foreground">Causation:</span> <span className="font-mono">{selectedEvent.causation_id ?? "—"}</span></div>
                  <div><span className="text-muted-foreground">Idempotency:</span> <span className="font-mono">{selectedEvent.idempotency_key ?? "—"}</span></div>
                  <div><span className="text-muted-foreground">Retention:</span> {selectedEvent.retention_class}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Payload:</span>
                  <pre className="mt-1 p-2 bg-muted/30 rounded text-[10px] overflow-auto max-h-40">{JSON.stringify(selectedEvent.payload, null, 2)}</pre>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Dead Letter Section */}
        {deadLetters.length > 0 && (
          <motion.div variants={fade}>
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-400" />Dead Letter Queue ({deadLetters.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {deadLetters.slice(0, 10).map(dl => (
                  <div key={dl.id} className="flex items-center gap-2 text-xs border-b border-border/20 pb-2">
                    <Badge variant="outline" className="text-[10px]">{dl.topic}</Badge>
                    <span className="text-muted-foreground">{dl.source}</span>
                    <span className="ml-auto text-muted-foreground">{new Date(dl.created_at).toLocaleString()}</span>
                    <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={() => handleReplay(dl.id)}>
                      <RotateCcw className="h-3 w-3 mr-1" />Retry
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
