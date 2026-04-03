// ═══════════════════════════════════════════════════════════════
// SITA OS — Sheets Workspace (Premium)
// Enhanced with formula bar, cell editing, chart integration,
// scenario planning, and domain-linked data
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo, useCallback } from "react";
import { SitaPageHeader, SitaCard, SitaCardTitle } from "@/components/sita/SitaCard";
import { SitaTabs } from "@/components/sita/SitaComponents";
import { motion, AnimatePresence } from "framer-motion";
import {
  Table2, Plus, Search, Clock, Download, Upload, BarChart3, Filter,
  ArrowUpDown, ChevronRight, Calculator, TrendingUp, PiggyBank,
  Sigma, Equal, Copy, Trash2, MoreVertical, Maximize2, Minimize2,
  Save, X, PlusCircle, ArrowDown, ArrowUp
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Sheet {
  id: string;
  name: string;
  type: "financial" | "planning" | "crm" | "metrics" | "custom";
  lastModified: string;
  linkedDomain: string;
  columns: string[];
  data: string[][];
  formulas: Record<string, string>;
}

const MOCK_SHEETS: Sheet[] = [
  {
    id: "1", name: "Revenue Tracker Q1", type: "financial", lastModified: "1h ago", linkedDomain: "Business",
    columns: ["Month", "Revenue", "Expenses", "Net", "Growth %", "Margin %"],
    data: [
      ["Jan 2026", "$42,300", "$28,100", "$14,200", "+8%", "33.6%"],
      ["Feb 2026", "$45,800", "$29,400", "$16,400", "+15%", "35.8%"],
      ["Mar 2026", "$51,200", "$31,800", "$19,400", "+18%", "37.9%"],
      ["Apr 2026", "$48,600", "$30,200", "$18,400", "-5%", "37.9%"],
    ],
    formulas: { "D1": "=B1-C1", "E1": "=(B2-B1)/B1*100" },
  },
  {
    id: "2", name: "Lead Scoring Matrix", type: "crm", lastModified: "3h ago", linkedDomain: "Business",
    columns: ["Lead", "Source", "Score", "Stage", "Value", "Probability", "Expected"],
    data: [
      ["Sarah Chen", "Referral", "92", "Proposal", "$84,000", "85%", "$71,400"],
      ["Marcus Johnson", "Inbound", "78", "Discovery", "$48,000", "40%", "$19,200"],
      ["Apex Industries", "Outbound", "65", "Qualified", "$120,000", "25%", "$30,000"],
      ["Dr. Patel", "Referral", "88", "Negotiation", "$36,000", "90%", "$32,400"],
    ],
    formulas: { "G1": "=E1*F1" },
  },
  {
    id: "3", name: "Monthly Budget vs Actual", type: "financial", lastModified: "1d ago", linkedDomain: "Finance",
    columns: ["Category", "Budget", "Actual", "Variance", "% Used", "Status"],
    data: [
      ["Housing", "$2,500", "$2,400", "$100", "96%", "✅ Under"],
      ["Food & Dining", "$1,200", "$1,280", "-$80", "107%", "⚠️ Over"],
      ["Transportation", "$800", "$640", "$160", "80%", "✅ Under"],
      ["Subscriptions", "$300", "$380", "-$80", "127%", "⚠️ Over"],
      ["Savings", "$2,000", "$2,000", "$0", "100%", "✅ On Track"],
      ["Entertainment", "$400", "$320", "$80", "80%", "✅ Under"],
    ],
    formulas: { "D1": "=B1-C1", "E1": "=C1/B1*100" },
  },
  {
    id: "4", name: "Scenario Planner — Expansion", type: "planning", lastModified: "2d ago", linkedDomain: "Business",
    columns: ["Scenario", "Revenue Impact", "Cost", "Net Impact", "Risk", "Timeline"],
    data: [
      ["Hire 2 Sales Reps", "+$180,000/yr", "$140,000/yr", "+$40,000/yr", "Medium", "6 months"],
      ["Launch Product B", "+$250,000/yr", "$80,000 upfront", "+$170,000/yr", "High", "12 months"],
      ["Expand to West Coast", "+$120,000/yr", "$60,000/yr", "+$60,000/yr", "Low", "3 months"],
      ["Increase Pricing 15%", "+$75,000/yr", "$0", "+$75,000/yr", "Medium", "Immediate"],
    ],
    formulas: {},
  },
  {
    id: "5", name: "KPI Dashboard Data", type: "metrics", lastModified: "4h ago", linkedDomain: "Boardroom",
    columns: ["KPI", "Target", "Current", "Trend", "Status", "Owner"],
    data: [
      ["Monthly Revenue", "$50,000", "$51,200", "↑ 18%", "✅ Above", "Business"],
      ["Customer Retention", "95%", "94%", "↓ 1%", "⚠️ Below", "Business"],
      ["Net Promoter Score", "50", "62", "↑ 8pts", "✅ Above", "Business"],
      ["Savings Rate", "25%", "27.2%", "↑ 2.2%", "✅ Above", "Finance"],
      ["Pipeline Coverage", "3x", "3.2x", "↑ 0.2x", "✅ Above", "Business"],
      ["Task Completion Rate", "90%", "87%", "↓ 3%", "⚠️ Below", "Concierge"],
    ],
    formulas: {},
  },
];

const SheetsWorkspace = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedSheet, setSelectedSheet] = useState<string | null>(null);
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);
  const [cellValue, setCellValue] = useState("");
  const [sortColumn, setSortColumn] = useState<number | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [formulaBarValue, setFormulaBarValue] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const tabs = [
    { key: "all", label: "All Sheets" },
    { key: "financial", label: "Financial" },
    { key: "crm", label: "CRM" },
    { key: "planning", label: "Planning" },
    { key: "metrics", label: "Metrics" },
  ];

  const filteredSheets = MOCK_SHEETS.filter(s => activeTab === "all" || s.type === activeTab);
  const activeSheet = selectedSheet ? MOCK_SHEETS.find(s => s.id === selectedSheet) : null;

  const sortedData = useMemo(() => {
    if (!activeSheet || sortColumn === null) return activeSheet?.data ?? [];
    return [...activeSheet.data].sort((a, b) => {
      const valA = a[sortColumn] ?? "";
      const valB = b[sortColumn] ?? "";
      const numA = parseFloat(valA.replace(/[$,%+]/g, ""));
      const numB = parseFloat(valB.replace(/[$,%+]/g, ""));
      if (!isNaN(numA) && !isNaN(numB)) {
        return sortDirection === "asc" ? numA - numB : numB - numA;
      }
      return sortDirection === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });
  }, [activeSheet, sortColumn, sortDirection]);

  const handleSort = (colIndex: number) => {
    if (sortColumn === colIndex) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(colIndex);
      setSortDirection("asc");
    }
  };

  const startEditing = (row: number, col: number) => {
    setEditingCell({ row, col });
    setCellValue(sortedData[row]?.[col] ?? "");
    setFormulaBarValue(sortedData[row]?.[col] ?? "");
  };

  const finishEditing = () => {
    setEditingCell(null);
    setCellValue("");
    setFormulaBarValue("");
  };

  const getTotalRow = useCallback((data: string[][], columns: string[]): string[] => {
    return columns.map((col, i) => {
      if (i === 0) return "Total";
      const values = data.map(row => parseFloat(row[i]?.replace(/[$,%+↑↓ ]/g, "") ?? "0")).filter(v => !isNaN(v));
      if (values.length === 0) return "";
      const sum = values.reduce((a, b) => a + b, 0);
      if (col.includes("%") || data[0]?.[i]?.includes("%")) return `${(sum / values.length).toFixed(1)}%`;
      if (data[0]?.[i]?.startsWith("$")) return `$${sum.toLocaleString()}`;
      return sum.toLocaleString();
    });
  }, []);

  // ── Sheet Detail View ──────────────────────────────────────────

  if (activeSheet) {
    const totalRow = getTotalRow(activeSheet.data, activeSheet.columns);

    return (
      <div className={`${isFullscreen ? "fixed inset-0 z-50 bg-background" : "mx-auto max-w-7xl"} space-y-4`}>
        {/* Sheet Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => { setSelectedSheet(null); setIsFullscreen(false); }} className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary transition-colors">
              <X className="h-4 w-4" />
            </button>
            <div className="rounded-xl bg-accent/10 p-2">
              <Table2 className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">{activeSheet.name}</h2>
              <p className="text-[11px] text-muted-foreground">
                {activeSheet.data.length} rows · {activeSheet.columns.length} columns · {activeSheet.linkedDomain} · {activeSheet.lastModified}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button className="rounded-lg bg-secondary px-2.5 py-1.5 text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              <Filter className="h-3 w-3" /> Filter
            </button>
            <button className="rounded-lg bg-secondary px-2.5 py-1.5 text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              <Calculator className="h-3 w-3" /> Formulas
            </button>
            <button className="rounded-lg bg-secondary px-2.5 py-1.5 text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              <BarChart3 className="h-3 w-3" /> Chart
            </button>
            <button className="rounded-lg bg-secondary px-2.5 py-1.5 text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              <Download className="h-3 w-3" /> Export
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary transition-colors"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-lg gradient-sita px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
              <Save className="h-3.5 w-3.5" /> Save
            </button>
          </div>
        </div>

        {/* Formula Bar */}
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5">
          <Sigma className="h-4 w-4 text-muted-foreground shrink-0" />
          <Equal className="h-3 w-3 text-muted-foreground shrink-0" />
          <input
            value={formulaBarValue}
            onChange={(e) => setFormulaBarValue(e.target.value)}
            placeholder={editingCell ? `Editing ${activeSheet.columns[editingCell.col]} Row ${editingCell.row + 1}` : "Select a cell to edit..."}
            className="flex-1 bg-transparent text-sm font-mono text-foreground placeholder:text-muted-foreground outline-none"
          />
          {editingCell && (
            <span className="text-[10px] text-muted-foreground font-mono">
              {String.fromCharCode(65 + editingCell.col)}{editingCell.row + 1}
            </span>
          )}
        </div>

        {/* Data Grid */}
        <SitaCard hover={false} className="overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/30">
                  <TableHead className="w-8 text-center text-[10px] text-muted-foreground">#</TableHead>
                  {activeSheet.columns.map((col, i) => (
                    <TableHead
                      key={col}
                      className="text-[11px] font-semibold uppercase tracking-wider cursor-pointer hover:bg-secondary/50 transition-colors select-none"
                      onClick={() => handleSort(i)}
                    >
                      <span className="flex items-center gap-1">
                        {col}
                        {sortColumn === i ? (
                          sortDirection === "asc" ? <ArrowUp className="h-2.5 w-2.5 text-primary" /> : <ArrowDown className="h-2.5 w-2.5 text-primary" />
                        ) : (
                          <ArrowUpDown className="h-2.5 w-2.5 text-muted-foreground/40" />
                        )}
                      </span>
                    </TableHead>
                  ))}
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedData.map((row, rowIdx) => (
                  <TableRow key={rowIdx} className="hover:bg-secondary/20 group">
                    <TableCell className="text-center text-[10px] text-muted-foreground font-mono">{rowIdx + 1}</TableCell>
                    {row.map((cell, colIdx) => (
                      <TableCell
                        key={colIdx}
                        className={`text-sm font-mono cursor-pointer transition-colors ${
                          editingCell?.row === rowIdx && editingCell?.col === colIdx
                            ? "bg-primary/5 ring-2 ring-primary/30"
                            : "hover:bg-secondary/30"
                        }`}
                        onClick={() => startEditing(rowIdx, colIdx)}
                        onDoubleClick={() => startEditing(rowIdx, colIdx)}
                      >
                        {editingCell?.row === rowIdx && editingCell?.col === colIdx ? (
                          <input
                            value={cellValue}
                            onChange={(e) => { setCellValue(e.target.value); setFormulaBarValue(e.target.value); }}
                            onBlur={finishEditing}
                            onKeyDown={(e) => e.key === "Enter" && finishEditing()}
                            className="w-full bg-transparent outline-none font-mono text-sm"
                            autoFocus
                          />
                        ) : (
                          <span className={
                            cell.startsWith("+") || cell.includes("↑") || cell === "✅ Under" || cell === "✅ Above" || cell === "✅ On Track"
                              ? "text-primary"
                              : cell.startsWith("-") || cell.includes("↓") || cell.includes("⚠️")
                                ? "text-destructive"
                                : ""
                          }>
                            {cell}
                          </span>
                        )}
                      </TableCell>
                    ))}
                    <TableCell className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="rounded p-1 text-muted-foreground hover:bg-secondary transition-colors">
                        <MoreVertical className="h-3 w-3" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}

                {/* Summary Row */}
                <TableRow className="bg-secondary/20 font-semibold border-t-2 border-border">
                  <TableCell className="text-center text-[10px] text-muted-foreground">Σ</TableCell>
                  {totalRow.map((cell, i) => (
                    <TableCell key={i} className="text-sm font-mono font-semibold text-foreground">{cell}</TableCell>
                  ))}
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </SitaCard>

        {/* Quick Stats */}
        <div className="grid gap-3 sm:grid-cols-4">
          {[
            { label: "Rows", value: activeSheet.data.length.toString(), icon: Table2 },
            { label: "Columns", value: activeSheet.columns.length.toString(), icon: ArrowUpDown },
            { label: "Formulas", value: Object.keys(activeSheet.formulas).length.toString(), icon: Calculator },
            { label: "Domain", value: activeSheet.linkedDomain, icon: TrendingUp },
          ].map(stat => (
            <SitaCard key={stat.label} className="p-3" hover>
              <div className="flex items-center gap-2">
                <stat.icon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                  <p className="text-sm font-semibold text-foreground">{stat.value}</p>
                </div>
              </div>
            </SitaCard>
          ))}
        </div>

        {/* Add Row */}
        <button className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-border py-2.5 text-xs text-muted-foreground hover:bg-secondary/30 hover:border-primary/30 transition-colors">
          <PlusCircle className="h-3.5 w-3.5" /> Add Row
        </button>
      </div>
    );
  }

  // ── Sheet List View ────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <SitaPageHeader
        title="Sheets"
        subtitle="Structured grids, financial tables, and scenario planners — connected to your data"
        actions={
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary/80 transition-colors">
              <Upload className="h-3.5 w-3.5" /> Import
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-lg gradient-sita px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
              <Plus className="h-3.5 w-3.5" /> New Sheet
            </button>
          </div>
        }
      />

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search sheets..."
          className="w-full rounded-xl border border-border bg-secondary/30 py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:ring-2 focus:ring-primary/20 focus:outline-none"
        />
      </div>

      <SitaTabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filteredSheets.map((sheet, i) => (
          <motion.div key={sheet.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <SitaCard
              className="p-0 overflow-hidden cursor-pointer"
              hover
              onClick={() => setSelectedSheet(sheet.id)}
            >
              {/* Mini preview */}
              <div className="p-3 border-b border-border bg-secondary/10">
                <div className="overflow-hidden rounded border border-border/50">
                  <table className="w-full text-[8px] font-mono">
                    <thead>
                      <tr className="bg-secondary/30">
                        {sheet.columns.slice(0, 4).map(col => (
                          <th key={col} className="px-1.5 py-0.5 text-left text-muted-foreground font-medium truncate">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sheet.data.slice(0, 2).map((row, ri) => (
                        <tr key={ri} className="border-t border-border/30">
                          {row.slice(0, 4).map((cell, ci) => (
                            <td key={ci} className="px-1.5 py-0.5 truncate text-foreground/60">{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{sheet.name}</p>
                    <div className="flex items-center gap-2 mt-1.5 text-[11px] text-muted-foreground">
                      <span>{sheet.data.length} rows</span>
                      <span>·</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {sheet.lastModified}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-[9px] font-medium text-muted-foreground">{sheet.linkedDomain}</span>
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-[9px] font-medium text-muted-foreground capitalize">{sheet.type}</span>
                      {Object.keys(sheet.formulas).length > 0 && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-medium text-primary flex items-center gap-0.5">
                          <Calculator className="h-2.5 w-2.5" /> {Object.keys(sheet.formulas).length}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/40 mt-1" />
                </div>
              </div>
            </SitaCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SheetsWorkspace;
