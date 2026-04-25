import { useState, useMemo } from "react";
import { SitaPageHeader } from "@/platform/sita/components/sita/SitaPageHeader";
import { SitaTabs } from "@/platform/sita/components/sita/SitaComponents";
import { SitaCard } from "@/platform/sita/components/sita/SitaCard";
import { Grid3X3, Download, Upload, Plus, Filter, ArrowUpDown, Search, Trash2, Copy, Edit3, MoreHorizontal, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { PageShell } from "@/platform/sita/components/sita/PageShell";

interface DataRow {
  id: string;
  cells: Record<string, string>;
  selected: boolean;
}

const defaultColumns = ["Name", "Category", "Amount", "Status", "Date", "Owner", "Notes"];

const demoData: DataRow[] = [
  { id: "1", selected: false, cells: { Name: "Q1 Marketing Budget", Category: "Marketing", Amount: "$12,500", Status: "Approved", Date: "2026-01-15", Owner: "You", Notes: "Includes digital spend" } },
  { id: "2", selected: false, cells: { Name: "Office Lease", Category: "Operations", Amount: "$4,200/mo", Status: "Active", Date: "2026-02-01", Owner: "Business Advisor", Notes: "Renewed annually" } },
  { id: "3", selected: false, cells: { Name: "Software Licenses", Category: "Technology", Amount: "$890", Status: "Pending Review", Date: "2026-03-10", Owner: "You", Notes: "Annual renewal due" } },
  { id: "4", selected: false, cells: { Name: "Team Retreat", Category: "HR", Amount: "$3,400", Status: "Draft", Date: "2026-04-01", Owner: "Concierge", Notes: "Q2 planning" } },
  { id: "5", selected: false, cells: { Name: "Client Dinner", Category: "Sales", Amount: "$280", Status: "Approved", Date: "2026-04-05", Owner: "You", Notes: "Prospect meeting" } },
  { id: "6", selected: false, cells: { Name: "Insurance Premium", Category: "Finance", Amount: "$1,100", Status: "Active", Date: "2026-04-08", Owner: "Money Advisor", Notes: "Quarterly" } },
  { id: "7", selected: false, cells: { Name: "Contractor Payment", Category: "Operations", Amount: "$6,750", Status: "Pending Review", Date: "2026-04-09", Owner: "You", Notes: "Design project" } },
  { id: "8", selected: false, cells: { Name: "Cloud Hosting", Category: "Technology", Amount: "$340/mo", Status: "Active", Date: "2026-03-01", Owner: "System", Notes: "Auto-scaling enabled" } },
];

const SpreadsheetWorkspace = () => {
  const [data, setData] = useState<DataRow[]>(demoData);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [editCell, setEditCell] = useState<{ row: string; col: string } | null>(null);
  const [editValue, setEditValue] = useState("");

  const selectedCount = data.filter(r => r.selected).length;

  const filteredData = useMemo(() => {
    let d = data;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      d = d.filter(r => Object.values(r.cells).some(v => v.toLowerCase().includes(q)));
    }
    if (sortCol) {
      d = [...d].sort((a, b) => {
        const va = a.cells[sortCol] || "";
        const vb = b.cells[sortCol] || "";
        return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
      });
    }
    return d;
  }, [data, searchQuery, sortCol, sortAsc]);

  const toggleSort = (col: string) => {
    if (sortCol === col) { setSortAsc(!sortAsc); }
    else { setSortCol(col); setSortAsc(true); }
  };

  const toggleSelectAll = () => {
    const allSelected = data.every(r => r.selected);
    setData(data.map(r => ({ ...r, selected: !allSelected })));
  };

  const toggleSelect = (id: string) => {
    setData(data.map(r => r.id === id ? { ...r, selected: !r.selected } : r));
  };

  const startEdit = (rowId: string, col: string, value: string) => {
    setEditCell({ row: rowId, col });
    setEditValue(value);
  };

  const commitEdit = () => {
    if (!editCell) return;
    setData(data.map(r => r.id === editCell.row ? { ...r, cells: { ...r.cells, [editCell.col]: editValue } } : r));
    setEditCell(null);
  };

  return (
    <PageShell width="wide">
<SitaPageHeader icon={<Grid3X3 className="h-6 w-6" />} title="Data Grid" subtitle="View, edit, filter, and export structured data with full audit trail">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm"><Upload className="h-4 w-4 mr-1" /> Import CSV</Button>
          <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" /> Export</Button>
        </div>
      </SitaPageHeader>

      {/* Toolbar */}
      <SitaCard className="p-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search all columns..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="h-8 max-w-xs" />
          <Button variant="outline" size="sm"><Filter className="h-3.5 w-3.5 mr-1" /> Filter</Button>
        </div>
        <div className="flex items-center gap-2">
          {selectedCount > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="outline">{selectedCount} selected</Badge>
              <Button variant="ghost" size="sm"><Copy className="h-3.5 w-3.5 mr-1" /> Duplicate</Button>
              <Button variant="ghost" size="sm" className="text-destructive"><Trash2 className="h-3.5 w-3.5 mr-1" /> Delete</Button>
            </div>
          )}
          <Button size="sm"><Plus className="h-3.5 w-3.5 mr-1" /> Add Row</Button>
        </div>
      </SitaCard>

      {/* Grid */}
      <SitaCard className="p-0 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox checked={data.every(r => r.selected)} onCheckedChange={toggleSelectAll} />
              </TableHead>
              <TableHead className="w-8 text-xs text-muted-foreground">#</TableHead>
              {defaultColumns.map(col => (
                <TableHead key={col} className="cursor-pointer select-none" onClick={() => toggleSort(col)}>
                  <div className="flex items-center gap-1">
                    {col}
                    <ArrowUpDown className={`h-3 w-3 ${sortCol === col ? "text-primary" : "text-muted-foreground/40"}`} />
                  </div>
                </TableHead>
              ))}
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((row, idx) => (
              <TableRow key={row.id} className={row.selected ? "bg-primary/5" : ""}>
                <TableCell>
                  <Checkbox checked={row.selected} onCheckedChange={() => toggleSelect(row.id)} />
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{idx + 1}</TableCell>
                {defaultColumns.map(col => (
                  <TableCell
                    key={col}
                    className="cursor-pointer hover:bg-muted/30 transition-colors"
                    onDoubleClick={() => startEdit(row.id, col, row.cells[col] || "")}
                  >
                    {editCell?.row === row.id && editCell.col === col ? (
                      <Input
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        onBlur={commitEdit}
                        onKeyDown={e => e.key === "Enter" && commitEdit()}
                        className="h-7 text-sm"
                        autoFocus
                      />
                    ) : (
                      <span className="text-sm">{row.cells[col] || ""}</span>
                    )}
                  </TableCell>
                ))}
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-3.5 w-3.5" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem><Edit3 className="h-3.5 w-3.5 mr-2" /> Edit</DropdownMenuItem>
                      <DropdownMenuItem><Copy className="h-3.5 w-3.5 mr-2" /> Duplicate</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive"><Trash2 className="h-3.5 w-3.5 mr-2" /> Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </SitaCard>

      {/* Summary bar */}
      <SitaCard className="p-3 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{filteredData.length} rows · {defaultColumns.length} columns</span>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>Sum (Amount): <span className="text-foreground font-medium">$29,460</span></span>
          <span>Avg: <span className="text-foreground font-medium">$3,683</span></span>
        </div>
      </SitaCard>
    </PageShell>
  );
};

export default SpreadsheetWorkspace;
