import { useState } from "react";
import { SitaPageHeader } from "@/components/sita/SitaPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Download, FileText, Shield, Archive, Clock, CheckCircle2,
  AlertTriangle, Trash2, RefreshCw, HardDrive,
} from "lucide-react";
import { MobileHonestyNotice } from "@/components/platform/MobileHonestyNotice";
import { PageShell } from "@/components/sita/PageShell";

const mockDownloads = [
  { id: "1", name: "Q1 Financial Report.pdf", type: "report", size: "2.4 MB", status: "complete" as const, date: "2026-04-08", expiresIn: "29 days" },
  { id: "2", name: "Proof Bundle — Invoice #1042.zip", type: "proof", size: "512 KB", status: "complete" as const, date: "2026-04-07", expiresIn: "28 days" },
  { id: "3", name: "Contact Export.csv", type: "export", size: "184 KB", status: "complete" as const, date: "2026-04-06", expiresIn: "27 days" },
  { id: "4", name: "Audit Log — March 2026.pdf", type: "audit", size: "1.1 MB", status: "expired" as const, date: "2026-03-01", expiresIn: null },
  { id: "5", name: "Backup Snapshot.tar.gz", type: "backup", size: "45 MB", status: "pending" as const, date: "2026-04-09", expiresIn: "30 days" },
];

const typeIcons: Record<string, typeof FileText> = {
  report: FileText,
  proof: Shield,
  export: Download,
  audit: FileText,
  backup: HardDrive,
};

export default function DownloadsCenter() {
  const [activeTab, setActiveTab] = useState("all");

  const filtered = activeTab === "all"
    ? mockDownloads
    : mockDownloads.filter((d) => d.type === activeTab);

  return (
    <PageShell width="wide">
      <SitaPageHeader
        icon={<Download className="h-6 w-6" />}
        title="Downloads Center"
        subtitle="Exports, reports, proof bundles, generated files, and audit downloads"
      >
        <Button variant="outline" size="sm">
          <Trash2 className="h-4 w-4 mr-1.5" /> Clean Expired
        </Button>
      </SitaPageHeader>

      <MobileHonestyNotice />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{mockDownloads.filter((d) => d.status === "complete").length}</p>
            <p className="text-xs text-muted-foreground">Available</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{mockDownloads.filter((d) => d.status === "pending").length}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{mockDownloads.filter((d) => d.status === "expired").length}</p>
            <p className="text-xs text-muted-foreground">Expired</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">49.2 MB</p>
            <p className="text-xs text-muted-foreground">Total Size</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="report">Reports</TabsTrigger>
          <TabsTrigger value="proof">Proof Bundles</TabsTrigger>
          <TabsTrigger value="export">Exports</TabsTrigger>
          <TabsTrigger value="audit">Audit</TabsTrigger>
          <TabsTrigger value="backup">Backups</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <div className="space-y-2">
            {filtered.map((dl) => {
              const Icon = typeIcons[dl.type] || FileText;
              return (
                <Card key={dl.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-muted-foreground shrink-0" />
                      <div>
                        <p className="text-sm font-medium">{dl.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {dl.size} · {dl.date}
                          {dl.expiresIn && ` · Expires in ${dl.expiresIn}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          dl.status === "complete" ? "default" :
                          dl.status === "pending" ? "secondary" : "outline"
                        }
                        className="gap-1"
                      >
                        {dl.status === "complete" && <CheckCircle2 className="h-3 w-3" />}
                        {dl.status === "pending" && <Clock className="h-3 w-3" />}
                        {dl.status === "expired" && <AlertTriangle className="h-3 w-3" />}
                        {dl.status}
                      </Badge>
                      {dl.status === "complete" && (
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                      {dl.status === "expired" && (
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {filtered.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  <Archive className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No downloads in this category</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}
