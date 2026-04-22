import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import type { WebhookEvent, WebhookFilterState } from "@/lib/recovery-ops/types";
import { createRecoveryJob } from "@/lib/recovery-ops/recovery-job-service";
import { RefreshCw, Filter, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useDataMode } from "@/contexts/DataModeContext";

// Mock webhook events for demonstration
const MOCK_EVENTS: WebhookEvent[] = [
  { id: "wh-001", eventType: "payment.completed", status: "failed", timestamp: "2026-04-21T10:30:00Z", payload: { amount: 99 }, errorMessage: "Timeout after 30s", provider: "stripe", retryCount: 3 },
  { id: "wh-002", eventType: "contact.created", status: "delivered", timestamp: "2026-04-21T10:28:00Z", payload: { email: "test@example.com" }, errorMessage: null, provider: "crm", retryCount: 0 },
  { id: "wh-003", eventType: "payment.refunded", status: "failed", timestamp: "2026-04-21T09:15:00Z", payload: { amount: 50 }, errorMessage: "502 Bad Gateway", provider: "stripe", retryCount: 2 },
  { id: "wh-004", eventType: "subscription.updated", status: "delivered", timestamp: "2026-04-21T09:00:00Z", payload: { plan: "pro" }, errorMessage: null, provider: "billing", retryCount: 0 },
  { id: "wh-005", eventType: "contact.updated", status: "pending", timestamp: "2026-04-21T08:45:00Z", payload: { field: "name" }, errorMessage: null, provider: "crm", retryCount: 0 },
  { id: "wh-006", eventType: "invoice.created", status: "failed", timestamp: "2026-04-20T22:00:00Z", payload: { invoiceId: "INV-100" }, errorMessage: "Connection refused", provider: "billing", retryCount: 5 },
  { id: "wh-007", eventType: "payment.completed", status: "replayed", timestamp: "2026-04-20T20:00:00Z", payload: { amount: 200 }, errorMessage: null, provider: "stripe", retryCount: 1 },
];

interface Props {
  operatorId: string;
  canExecute: boolean;
}

export function WebhookReplayPanel({ operatorId, canExecute }: Props) {
  const { isDemoMode } = useDataMode();
  const { toast } = useToast();
  const [filters, setFilters] = useState<WebhookFilterState>({
    eventType: "",
    status: "",
    dateFrom: "",
    dateTo: "",
  });
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    return (isDemoMode ? MOCK_EVENTS : [] as typeof MOCK_EVENTS).filter((e) => {
      if (filters.eventType && e.eventType !== filters.eventType) return false;
      if (filters.status && e.status !== filters.status) return false;
      if (filters.dateFrom && e.timestamp < filters.dateFrom) return false;
      if (filters.dateTo && e.timestamp > filters.dateTo) return false;
      return true;
    });
  }, [filters]);

  const eventTypes = [...new Set((isDemoMode ? MOCK_EVENTS : [] as typeof MOCK_EVENTS).map((e) => e.eventType))];
  const failedFiltered = filtered.filter((e) => e.status === "failed");

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllFailed = () => {
    setSelected(new Set(failedFiltered.map((e) => e.id)));
  };

  const replaySelected = () => {
    if (!canExecute) {
      toast({ title: "Permission denied", description: "admin.recovery permission required", variant: "destructive" });
      return;
    }
    const ids = Array.from(selected);
    createRecoveryJob("webhook-replay", `Replay ${ids.length} webhook(s)`, operatorId, false, { webhookIds: ids });
    toast({ title: "Replay job started", description: `${ids.length} webhook(s) queued for replay` });
    setSelected(new Set());
  };

  const statusColor: Record<string, string> = {
    delivered: "bg-green-500/20 text-green-300",
    failed: "bg-destructive/20 text-destructive",
    pending: "bg-yellow-500/20 text-yellow-300",
    replayed: "bg-primary/20 text-primary",
  };

  return (
    <Card className="bg-card/50 backdrop-blur border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm text-foreground flex items-center gap-2">
            <RefreshCw className="h-4 w-4" /> Webhook Replay
          </CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="text-xs h-7" onClick={selectAllFailed} disabled={failedFiltered.length === 0}>
              Select All Failed ({failedFiltered.length})
            </Button>
            <Button size="sm" className="text-xs h-7" onClick={replaySelected} disabled={selected.size === 0 || !canExecute}>
              <Send className="h-3 w-3 mr-1" /> Replay Selected ({selected.size})
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Filters */}
        <div className="flex gap-2 flex-wrap items-end">
          <div className="flex items-center gap-1 text-xs text-muted-foreground"><Filter className="h-3 w-3" /> Filters:</div>
          <Select value={filters.eventType} onValueChange={(v) => setFilters((f) => ({ ...f, eventType: v === "all" ? "" : v }))}>
            <SelectTrigger className="h-7 w-40 text-xs"><SelectValue placeholder="Event type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
               {eventTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filters.status} onValueChange={(v) => setFilters((f) => ({ ...f, status: v === "all" ? "" : v }))}>
            <SelectTrigger className="h-7 w-32 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="replayed">Replayed</SelectItem>
            </SelectContent>
          </Select>
          <Input type="date" className="h-7 w-36 text-xs" value={filters.dateFrom} onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value }))} placeholder="From" />
          <Input type="date" className="h-7 w-36 text-xs" value={filters.dateTo} onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value }))} placeholder="To" />
          {(filters.eventType || filters.status || filters.dateFrom || filters.dateTo) && (
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setFilters({ eventType: "", status: "", dateFrom: "", dateTo: "" })}>
              Clear
            </Button>
          )}
        </div>

        {/* Event List */}
        <div className="space-y-1 max-h-80 overflow-y-auto">
          {filtered.map((evt) => (
            <div key={evt.id} className="flex items-center gap-3 p-2 rounded hover:bg-secondary/30 text-xs">
              <Checkbox checked={selected.has(evt.id)} onCheckedChange={() => toggleSelect(evt.id)} disabled={evt.status !== "failed"} />
              <span className="font-mono w-16 text-muted-foreground">{evt.id}</span>
              <Badge variant="outline" className={`${statusColor[evt.status]} text-[10px]`}>{evt.status}</Badge>
              <span className="text-foreground flex-1">{evt.eventType}</span>
              <span className="text-muted-foreground">{evt.provider}</span>
              <span className="text-muted-foreground">{new Date(evt.timestamp).toLocaleString()}</span>
              {evt.retryCount > 0 && <span className="text-muted-foreground">×{evt.retryCount}</span>}
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-center py-4 text-muted-foreground text-xs">No events match the current filters</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}