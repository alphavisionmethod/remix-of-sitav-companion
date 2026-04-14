import { MobileShell } from "@/components/mobile/MobileShell";
import { FileText, Image, FileSpreadsheet, Folder, Clock } from "lucide-react";

const recentFiles = [
  { name: "Q1 Revenue Report.pdf", icon: FileText, date: "2 hours ago", color: "text-red-400" },
  { name: "Brand Assets", icon: Folder, date: "Yesterday", color: "text-amber-400" },
  { name: "Invoice #4821.xlsx", icon: FileSpreadsheet, date: "2 days ago", color: "text-emerald-400" },
  { name: "Product Mockup.png", icon: Image, date: "3 days ago", color: "text-blue-400" },
  { name: "Board Deck - April.pdf", icon: FileText, date: "1 week ago", color: "text-red-400" },
];

const MobileFiles = () => (
  <MobileShell title="Files">
    <div className="flex items-center gap-2 mb-4">
      <Clock className="h-4 w-4 text-muted-foreground" />
      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recent Files</h2>
    </div>
    <div className="space-y-2">
      {recentFiles.map((f) => {
        const Icon = f.icon;
        return (
          <div key={f.name} className="flex items-center gap-3 rounded-xl border border-border/40 bg-card px-4 py-3">
            <Icon className={`h-5 w-5 shrink-0 ${f.color}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{f.name}</p>
              <p className="text-[11px] text-muted-foreground">{f.date}</p>
            </div>
          </div>
        );
      })}
    </div>
  </MobileShell>
);

export default MobileFiles;
