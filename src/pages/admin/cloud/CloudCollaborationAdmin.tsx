import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import {
  Users, Share2, Link, Shield, Building2, Eye, Globe,
  Lock, UserPlus, FolderOpen, FileText, Settings2, Zap
} from "lucide-react";

interface SharingConfig {
  key: string;
  label: string;
  description: string;
  enabled: boolean;
  scope: string;
  icon: React.ElementType;
}

interface SharedResource {
  id: string;
  name: string;
  type: "file" | "folder" | "link";
  sharedBy: string;
  sharedWith: string[];
  permission: "view" | "edit" | "admin";
  createdAt: string;
  expiresAt?: string;
  accessCount: number;
}

interface TeamWorkspace {
  id: string;
  name: string;
  members: number;
  maxMembers: number;
  storageUsed: number;
  storageLimit: number;
  owner: string;
  status: "active" | "trial" | "suspended";
  sharedNamespaces: string[];
}

function timeSince(dateStr: string) {
  const ms = Date.now() - new Date(dateStr).getTime();
  if (ms < 3600000) return `${Math.floor(ms / 60000)}m ago`;
  if (ms < 86400000) return `${Math.floor(ms / 3600000)}h ago`;
  return `${Math.floor(ms / 86400000)}d ago`;
}

function formatBytes(b: number) {
  if (b === 0) return "0 B";
  const k = 1024;
  const s = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(b) / Math.log(k));
  return `${(b / Math.pow(k, i)).toFixed(1)} ${s[i]}`;
}

export function CloudCollaborationAdmin() {
  const [sharingConfigs, setSharingConfigs] = useState<SharingConfig[]>([
    { key: "file_sharing", label: "File Sharing", description: "Allow users to share individual files with other users", enabled: true, scope: "global", icon: FileText },
    { key: "folder_sharing", label: "Folder Sharing", description: "Allow users to share entire folders with read or write access", enabled: true, scope: "pro+", icon: FolderOpen },
    { key: "link_sharing", label: "Public Link Sharing", description: "Allow users to create shareable links accessible without authentication", enabled: true, scope: "global", icon: Link },
    { key: "team_workspaces", label: "Team Workspaces", description: "Enable team/organization accounts with shared storage pools", enabled: false, scope: "enterprise", icon: Building2 },
    { key: "collaborative_editing", label: "Collaborative Editing", description: "Real-time co-editing with presence indicators and cursors", enabled: false, scope: "enterprise", icon: Users },
    { key: "shared_namespaces", label: "Shared App-State Namespaces", description: "Allow apps to share state across multiple users in real-time", enabled: false, scope: "enterprise", icon: Zap },
    { key: "granular_acls", label: "Granular ACLs", description: "Fine-grained access control lists with role-based permissions", enabled: false, scope: "enterprise", icon: Shield },
    { key: "presence_tracking", label: "Collaborative Presence", description: "Show who is currently viewing or editing a shared resource", enabled: false, scope: "pro+", icon: Eye },
  ]);

  const sharedResources: SharedResource[] = [
    { id: "sr1", name: "Q4 Report.pdf", type: "file", sharedBy: "Alice Chen", sharedWith: ["Bob Martinez", "Carol Singh"], permission: "view", createdAt: new Date(Date.now() - 86400000).toISOString(), accessCount: 12 },
    { id: "sr2", name: "Design Assets", type: "folder", sharedBy: "Dave Kim", sharedWith: ["Alice Chen", "Eve Johnson", "Frank Li"], permission: "edit", createdAt: new Date(Date.now() - 172800000).toISOString(), accessCount: 47 },
    { id: "sr3", name: "Meeting Notes", type: "link", sharedBy: "Bob Martinez", sharedWith: ["Anyone with link"], permission: "view", createdAt: new Date(Date.now() - 3600000).toISOString(), expiresAt: new Date(Date.now() + 604800000).toISOString(), accessCount: 8 },
    { id: "sr4", name: "Product Specs", type: "folder", sharedBy: "Carol Singh", sharedWith: ["Team Engineering"], permission: "edit", createdAt: new Date(Date.now() - 604800000).toISOString(), accessCount: 156 },
    { id: "sr5", name: "Brand Guidelines.pdf", type: "file", sharedBy: "Grace Okafor", sharedWith: ["All Company"], permission: "view", createdAt: new Date(Date.now() - 2592000000).toISOString(), accessCount: 342 },
  ];

  const workspaces: TeamWorkspace[] = [
    { id: "w1", name: "Engineering Team", members: 12, maxMembers: 25, storageUsed: 45_000_000_000, storageLimit: 107_374_182_400, owner: "Alice Chen", status: "active", sharedNamespaces: ["code-reviews", "sprint-docs", "ci-artifacts"] },
    { id: "w2", name: "Design Studio", members: 5, maxMembers: 10, storageUsed: 23_000_000_000, storageLimit: 53_687_091_200, owner: "Dave Kim", status: "active", sharedNamespaces: ["design-system", "brand-assets"] },
    { id: "w3", name: "Executive Office", members: 3, maxMembers: 5, storageUsed: 8_000_000_000, storageLimit: 53_687_091_200, owner: "Bob Martinez", status: "trial", sharedNamespaces: ["board-documents", "financials"] },
  ];

  const toggleConfig = (key: string) => {
    setSharingConfigs(prev => prev.map(c => c.key === key ? { ...c, enabled: !c.enabled } : c));
  };

  const typeIcons: Record<string, React.ElementType> = { file: FileText, folder: FolderOpen, link: Link };
  const permColors: Record<string, string> = { view: "text-blue-400", edit: "text-amber-400", admin: "text-red-400" };

  return (
    <div className="space-y-6">
      {/* Readiness Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Sharing Features</p>
            <p className="text-2xl font-bold text-foreground mt-1">{sharingConfigs.filter(c => c.enabled).length}/{sharingConfigs.length}</p>
            <p className="text-xs text-muted-foreground">Enabled</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Active Shares</p>
            <p className="text-2xl font-bold text-foreground mt-1">{sharedResources.length}</p>
            <p className="text-xs text-muted-foreground">Resources shared</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Team Workspaces</p>
            <p className="text-2xl font-bold text-foreground mt-1">{workspaces.length}</p>
            <p className="text-xs text-muted-foreground">{workspaces.reduce((s, w) => s + w.members, 0)} members</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Total Access</p>
            <p className="text-2xl font-bold text-foreground mt-1">{sharedResources.reduce((s, r) => s + r.accessCount, 0)}</p>
            <p className="text-xs text-muted-foreground">Resource views</p>
          </CardContent>
        </Card>
      </div>

      {/* Collaboration Feature Toggles */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-primary" />
            Collaboration Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sharingConfigs.map(config => {
              const Icon = config.icon;
              return (
                <div key={config.key} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/30">
                  <div className="flex items-start gap-3 flex-1 mr-4">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{config.label}</span>
                        <Badge variant="outline" className="text-[10px]">{config.scope}</Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{config.description}</p>
                    </div>
                  </div>
                  <Switch checked={config.enabled} onCheckedChange={() => toggleConfig(config.key)} />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Shared Resources */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Share2 className="h-4 w-4 text-primary" />
              Active Shared Resources
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {sharedResources.map(res => {
              const TypeIcon = typeIcons[res.type] || FileText;
              return (
                <div key={res.id} className="p-3 rounded-lg bg-muted/20 border border-border/30">
                  <div className="flex items-center gap-2 mb-1">
                    <TypeIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium flex-1">{res.name}</span>
                    <Badge variant="outline" className={`text-[10px] capitalize ${permColors[res.permission]}`}>
                      {res.permission}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground ml-6">
                    <span>By {res.sharedBy}</span>
                    <span>·</span>
                    <span>{res.sharedWith.length === 1 ? res.sharedWith[0] : `${res.sharedWith.length} recipients`}</span>
                    <span>·</span>
                    <span>{res.accessCount} views</span>
                    <span>·</span>
                    <span>{timeSince(res.createdAt)}</span>
                  </div>
                  {res.expiresAt && (
                    <div className="ml-6 mt-1">
                      <Badge variant="secondary" className="text-[10px]">
                        <Clock className="h-2.5 w-2.5 mr-1" />
                        Expires {timeSince(res.expiresAt)}
                      </Badge>
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Team Workspaces */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              Team Workspaces
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {workspaces.map(ws => {
              const usagePct = Math.round((ws.storageUsed / ws.storageLimit) * 100);
              return (
                <div key={ws.id} className="p-4 rounded-lg bg-muted/20 border border-border/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold">{ws.name}</span>
                    </div>
                    <Badge variant={ws.status === "active" ? "default" : ws.status === "trial" ? "secondary" : "destructive"} className="text-xs capitalize">
                      {ws.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Members:</span>{" "}
                      <span className="font-medium">{ws.members}/{ws.maxMembers}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Owner:</span>{" "}
                      <span className="font-medium">{ws.owner}</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Storage</span>
                      <span className="font-medium">{usagePct}%</span>
                    </div>
                    <Progress value={usagePct} className="h-1.5" />
                    <p className="text-[10px] text-muted-foreground mt-1">{formatBytes(ws.storageUsed)} / {formatBytes(ws.storageLimit)}</p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {ws.sharedNamespaces.map(ns => (
                      <Badge key={ns} variant="outline" className="text-[10px] font-mono">{ns}</Badge>
                    ))}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Needed for timeSince in SharedResource expires display
function Clock(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  );
}