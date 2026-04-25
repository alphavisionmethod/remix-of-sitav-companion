// ═══════════════════════════════════════════════════════════════
// SITA OS — Runbook Viewer
// Renders the bundled markdown for a runbook with metadata header.
// ═══════════════════════════════════════════════════════════════

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Shield, AlertTriangle, Filter, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SitaCard } from "@/platform/sita/components/sita/SitaCard";
import { getRunbookEntry, loadRunbookMarkdown } from "@/lib/support/runbook-loader";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const SEVERITY_VARIANT: Record<string, "default" | "destructive" | "secondary" | "outline"> = {
  critical: "destructive",
  high:     "destructive",
  medium:   "default",
  low:      "secondary",
};

function renderInlineMarkdown(text: string): string {
  return text
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-secondary/40 text-[0.85em]">$1</code>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary underline">$1</a>');
}

function markdownToHtml(md: string): string {
  // Lightweight, dependency-free renderer (handles headings, lists, code blocks, tables)
  const lines = md.split("\n");
  const out: string[] = [];
  let inCode = false;
  let inList = false;
  let inOrderedList = false;
  let inTable = false;
  let tableHead = false;

  function closeBlocks() {
    if (inList) { out.push("</ul>"); inList = false; }
    if (inOrderedList) { out.push("</ol>"); inOrderedList = false; }
    if (inTable) { out.push("</tbody></table>"); inTable = false; tableHead = false; }
  }

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (line.startsWith("```")) {
      closeBlocks();
      if (inCode) { out.push("</code></pre>"); inCode = false; }
      else { out.push('<pre class="rounded-md bg-secondary/20 p-3 overflow-x-auto text-xs"><code>'); inCode = true; }
      continue;
    }
    if (inCode) { out.push(line.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")); continue; }

    if (/^#{1,6} /.test(line)) {
      closeBlocks();
      const level = line.match(/^#+/)![0].length;
      const text = renderInlineMarkdown(line.replace(/^#+\s*/, ""));
      out.push(`<h${level} class="mt-4 mb-2 font-semibold text-foreground">${text}</h${level}>`);
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      if (!inList) { closeBlocks(); out.push('<ul class="list-disc pl-5 space-y-1 my-2">'); inList = true; }
      out.push(`<li>${renderInlineMarkdown(line.replace(/^[-*]\s+/, ""))}</li>`);
      continue;
    }
    if (/^\d+\.\s+/.test(line)) {
      if (!inOrderedList) { closeBlocks(); out.push('<ol class="list-decimal pl-5 space-y-1 my-2">'); inOrderedList = true; }
      out.push(`<li>${renderInlineMarkdown(line.replace(/^\d+\.\s+/, ""))}</li>`);
      continue;
    }

    if (/^\|.*\|/.test(line)) {
      const cells = line.split("|").slice(1, -1).map((c) => c.trim());
      if (!inTable) {
        closeBlocks();
        out.push('<table class="my-3 border border-border/50 text-xs"><thead><tr>');
        cells.forEach((c) => out.push(`<th class="px-2 py-1 text-left bg-secondary/30">${renderInlineMarkdown(c)}</th>`));
        out.push("</tr></thead><tbody>");
        inTable = true;
        tableHead = true;
        continue;
      }
      // Skip the separator row |---|---|
      if (tableHead && cells.every((c) => /^:?-+:?$/.test(c))) {
        tableHead = false;
        continue;
      }
      out.push("<tr>");
      cells.forEach((c) => out.push(`<td class="px-2 py-1 border-t border-border/30">${renderInlineMarkdown(c)}</td>`));
      out.push("</tr>");
      continue;
    }

    if (line === "") {
      closeBlocks();
      out.push("");
      continue;
    }
    closeBlocks();
    out.push(`<p class="my-2 leading-relaxed">${renderInlineMarkdown(line)}</p>`);
  }
  closeBlocks();
  if (inCode) out.push("</code></pre>");
  return out.join("\n");
}

export function RunbookViewer({ runbookId }: { runbookId: string }) {
  const entry = useMemo(() => getRunbookEntry(runbookId), [runbookId]);
  const markdown = useMemo(() => loadRunbookMarkdown(runbookId), [runbookId]);
  const html = useMemo(() => (markdown ? markdownToHtml(markdown) : null), [markdown]);

  if (!entry) {
    return (
      <SitaCard className="p-6">
        <div className="text-sm text-destructive flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" /> Runbook not found: {runbookId}
        </div>
        <Button asChild variant="ghost" size="sm" className="mt-4">
          <Link to="/admin/founder/runbooks"><ArrowLeft className="h-3 w-3 mr-1" /> Back to Runbook Center</Link>
        </Button>
      </SitaCard>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link to="/admin/founder/runbooks"><ArrowLeft className="h-3 w-3 mr-1" /> Runbooks</Link>
        </Button>
        <Badge variant={SEVERITY_VARIANT[entry.severity] ?? "outline"} className="text-[10px]">
          {entry.severity.toUpperCase()}
        </Badge>
        <Badge variant="outline" className="text-[10px]">{entry.runbookId}</Badge>
        {entry.killSwitchRef && (
          <Link
            to={`/admin/automation/kill-switches?focus=${entry.killSwitchRef}`}
            className="ml-auto text-xs text-primary inline-flex items-center gap-1 hover:underline"
          >
            <Shield className="h-3 w-3" /> Kill switch: {entry.killSwitchRef}
          </Link>
        )}
      </div>

      <SitaCard className="p-6 space-y-2">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-semibold">{entry.title}</h1>
        </div>
        <p className="text-sm text-muted-foreground">{entry.description}</p>
        {entry.affectedServices.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-2">
            {entry.affectedServices.map((s) => (
              <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>
            ))}
          </div>
        )}
      </SitaCard>

      {/* Linked Alerts */}
      <LinkedAlertsSection runbookId={runbookId} />

      <SitaCard className="p-6">
        {html ? (
          <article className="prose prose-sm max-w-none text-foreground" dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <div className="space-y-3 text-sm">
            <div className="text-muted-foreground italic">
              No markdown bundle for this runbook — rendering structured steps from the registry.
            </div>
            <ol className="space-y-2 list-decimal pl-5">
              {entry.steps.map((s) => (
                <li key={s.order}>
                  <div className="font-medium">{s.action}</div>
                  {s.expectedOutcome && <div className="text-xs text-muted-foreground">→ {s.expectedOutcome}</div>}
                  {s.rollbackAction && <div className="text-xs text-amber-500">↩ {s.rollbackAction}</div>}
                </li>
              ))}
            </ol>
          </div>
        )}
      </SitaCard>
    </div>
  );
}

function LinkedAlertsSection({ runbookId }: { runbookId: string }) {
  const [sevFilter, setSevFilter] = useState<string>("all");
  const [serviceFilter, setServiceFilter] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<string>("all");

  const { data: alerts = [] } = useQuery({
    queryKey: ["runbook-linked-alerts", runbookId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("alerts")
        .select("id, title, severity, status, subsystem, last_seen_at")
        .eq("runbook_id", runbookId)
        .order("last_seen_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data ?? [];
    },
  });

  // Derive unique severity and subsystem values from result set
  const severityOptions = useMemo(() => {
    const set = new Set<string>();
    alerts.forEach((a: any) => { if (a.severity) set.add(a.severity); });
    return Array.from(set).sort();
  }, [alerts]);

  const serviceOptions = useMemo(() => {
    const set = new Set<string>();
    alerts.forEach((a: any) => { if (a.subsystem) set.add(a.subsystem); });
    return Array.from(set).sort();
  }, [alerts]);

  const filtered = useMemo(() => {
    let list = alerts;
    if (sevFilter !== "all") list = list.filter((a: any) => a.severity === sevFilter);
    if (serviceFilter !== "all") list = list.filter((a: any) => a.subsystem === serviceFilter);
    if (timeRange !== "all") {
      const cutoff = new Date();
      if (timeRange === "1h") cutoff.setHours(cutoff.getHours() - 1);
      else if (timeRange === "24h") cutoff.setHours(cutoff.getHours() - 24);
      else if (timeRange === "7d") cutoff.setDate(cutoff.getDate() - 7);
      list = list.filter((a: any) => new Date(a.last_seen_at) >= cutoff);
    }
    return list;
  }, [alerts, sevFilter, serviceFilter, timeRange]);

  function exportCsv() {
    const header = "ID,Title,Severity,Status,Subsystem,Last Seen";
    const rows = filtered.map((a: any) =>
      [a.id, `"${(a.title ?? "").replace(/"/g, '""')}"`, a.severity, a.status, a.subsystem ?? "", a.last_seen_at].join(",")
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `runbook-${runbookId}-alerts.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  if (alerts.length === 0) return null;

  const sevColor: Record<string, string> = {
    critical: "text-red-500", high: "text-orange-500", medium: "text-amber-500", low: "text-blue-500",
  };

  return (
    <SitaCard className="p-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" /> Linked Alerts ({filtered.length}/{alerts.length})
        </h2>
        <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={exportCsv} disabled={filtered.length === 0}>
          <Download className="h-3 w-3" /> Export CSV
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-3">
        <Filter className="h-3.5 w-3.5 text-muted-foreground" />
        <Select value={sevFilter} onValueChange={setSevFilter}>
          <SelectTrigger className="h-7 w-[110px] text-xs"><SelectValue placeholder="Severity" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severity</SelectItem>
            {severityOptions.map((s) => (
              <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={serviceFilter} onValueChange={setServiceFilter}>
          <SelectTrigger className="h-7 w-[140px] text-xs"><SelectValue placeholder="Service" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Services</SelectItem>
            {serviceOptions.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="h-7 w-[100px] text-xs"><SelectValue placeholder="Time" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="1h">Last 1h</SelectItem>
            <SelectItem value="24h">Last 24h</SelectItem>
            <SelectItem value="7d">Last 7d</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        {filtered.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-3">No alerts match current filters</p>
        )}
        {filtered.map((a: any) => (
          <Link
            key={a.id}
            to={`/admin/alerts?focus=${a.id}`}
            className="flex items-center justify-between p-2 rounded hover:bg-muted/30 transition-colors text-xs"
          >
            <div className="flex items-center gap-2">
              <span className={`font-medium ${sevColor[a.severity] ?? "text-muted-foreground"}`}>{a.severity}</span>
              <span>{a.title}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Badge variant="outline" className="text-[9px]">{a.status}</Badge>
              <span className="text-[10px]">{new Date(a.last_seen_at).toLocaleString()}</span>
            </div>
          </Link>
        ))}
      </div>
    </SitaCard>
  );
}
