// ═══════════════════════════════════════════════════════════════
// SITA OS — Runbook Viewer
// Renders the bundled markdown for a runbook with metadata header.
// ═══════════════════════════════════════════════════════════════

import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Shield, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SitaCard } from "@/components/sita/SitaCard";
import { getRunbookEntry, loadRunbookMarkdown } from "@/lib/support/runbook-loader";

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
