// ═══════════════════════════════════════════════════════════════
// SITA OS — Cloud Sharing & Collaboration Admin
// Active shares, links, ACLs, presence, workspaces
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Share2, Link2, Users, Eye, Lock, Globe, Clock, UserPlus,
  Shield, Folder, Trash2, MoreHorizontal, Copy, ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import { sharingEngine } from "@/platform/sync-engine/collaboration/sharing-engine";
const SHARES = [
  { id: "1", objectName: "Q4 Business Plan.pdf", sharedWith: 3, permission: "edit" as const, linkActive: true, createdAt: "2026-04-14T10:00:00Z" },
  { id: "2", objectName: "Family Budget 2026.xlsx", sharedWith: 2, permission: "read" as const, linkActive: false, createdAt: "2026-04-13T14:00:00Z" },
  { id: "3", objectName: "Travel Itinerary", sharedWith: 5, permission: "comment" as const, linkActive: true, createdAt: "2026-04-12T08:00:00Z" },
  { id: "4", objectName: "Product Roadmap", sharedWith: 8, permission: "admin" as const, linkActive: true, createdAt: "2026-04-10T16:00:00Z" },
];

const WORKSPACES = [
  { id: "ws1", name: "Business Strategy", members: 4, objects: 12, mode: "auto-merge" },
  { id: "ws2", name: "Family Photos", members: 3, objects: 248, mode: "last-write-wins" },
  { id: "ws3", name: "Q4 Planning", members: 6, objects: 8, mode: "manual" },
];

const PERMISSION_COLORS: Record<string, string> = {
  read: "text-blue-400 border-blue-400/30",
  comment: "text-cyan-400 border-cyan-400/30",
  edit: "text-emerald-400 border-emerald-400/30",
  admin: "text-amber-400 border-amber-400/30",
  owner: "text-primary border-primary/30",
};

export function CloudSharingAdmin() {
  const [activeSection, setActiveSection] = useState<"shares" | "links" | "workspaces" | "presence">("shares");
  const stats = sharingEngine.getStats();

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Shared Objects", value: stats.totalSharedObjects || ([] as any[]).length, icon: Share2, color: "text-primary" },
          { label: "Active Links", value: stats.totalLinks || 2, icon: Link2, color: "text-emerald-400" },
          { label: "Pending Invites", value: stats.pendingInvites || 1, icon: UserPlus, color: "text-amber-400" },
          { label: "Workspaces", value: stats.activeWorkspaces || ([] as any[]).length, icon: Folder, color: "text-cyan-400" },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="pt-4 pb-3 px-4">
              <div className="flex items-center gap-2 mb-1">
                <s.icon className={cn("h-4 w-4", s.color)} />
                <span className="text-xs text-muted-foreground">{s.label}</span>
              </div>
              <p className="text-2xl font-bold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Section Tabs */}
      <div className="flex gap-1 p-1 bg-muted/30 rounded-lg border border-border/30">
        {(["shares", "links", "workspaces", "presence"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveSection(tab)}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize",
              activeSection === tab ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Active Shares */}
      {activeSection === "shares" && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Share2 className="h-4 w-4 text-primary" /> Active Shares
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {([] as any[]).map(share => (
              <div key={share.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/30 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Share2 className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{share.objectName}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      <span>{share.sharedWith} people</span>
                      <span>·</span>
                      <Clock className="h-3 w-3" />
                      <span>{new Date(share.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={cn("text-xs capitalize", PERMISSION_COLORS[share.permission])}>
                    {share.permission}
                  </Badge>
                  {share.linkActive && (
                    <Badge variant="outline" className="text-xs text-emerald-400 border-emerald-400/30">
                      <Link2 className="h-3 w-3 mr-1" /> Link
                    </Badge>
                  )}
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Share Links */}
      {activeSection === "links" && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Link2 className="h-4 w-4 text-primary" /> Share Links
              </CardTitle>
              <Button size="sm" variant="outline" className="text-xs">
                <Link2 className="h-3 w-3 mr-1" /> Create Link
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { id: "l1", object: "Q4 Business Plan.pdf", permission: "read", uses: 3, maxUses: 10, expires: "2026-04-20", password: true, active: true },
              { id: "l2", object: "Travel Itinerary", permission: "edit", uses: 12, maxUses: undefined, expires: undefined, password: false, active: true },
              { id: "l3", object: "Meeting Notes", permission: "read", uses: 5, maxUses: 5, expires: "2026-04-10", password: false, active: false },
            ].map(link => (
              <div key={link.id} className={cn(
                "flex items-center justify-between p-3 rounded-lg border border-border/30",
                link.active ? "bg-muted/20" : "bg-muted/10 opacity-60"
              )}>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{link.object}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    <Badge variant="outline" className={cn("text-xs", PERMISSION_COLORS[link.permission])}>{link.permission}</Badge>
                    <span>{link.uses}{link.maxUses ? `/${link.maxUses}` : ""} uses</span>
                    {link.password && <><Lock className="h-3 w-3" /> Password</>}
                    {link.expires && <><Clock className="h-3 w-3" /> {link.expires}</>}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Badge variant={link.active ? "default" : "secondary"} className="text-xs">
                    {link.active ? "Active" : "Expired"}
                  </Badge>
                  {link.active && (
                    <>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0"><Copy className="h-3.5 w-3.5" /></Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Shared Workspaces */}
      {activeSection === "workspaces" && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Folder className="h-4 w-4 text-primary" /> Shared Workspaces
              </CardTitle>
              <Button size="sm" variant="outline" className="text-xs">
                <Folder className="h-3 w-3 mr-1" /> New Workspace
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {([] as any[]).map(ws => (
              <div key={ws.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/20 border border-border/30">
                <div>
                  <p className="text-sm font-semibold">{ws.name}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {ws.members} members</span>
                    <span className="flex items-center gap-1"><Share2 className="h-3 w-3" /> {ws.objects} objects</span>
                    <Badge variant="outline" className="text-xs">{ws.mode}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className="text-xs"><UserPlus className="h-3 w-3 mr-1" /> Invite</Button>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0"><ExternalLink className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Presence Monitor */}
      {activeSection === "presence" && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Eye className="h-4 w-4 text-primary" /> Active Presence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { user: "You", device: "MacBook Pro", object: "Q4 Business Plan.pdf", status: "editing", color: "#8b5cf6" },
                { user: "Alex", device: "iPad Pro", object: "Q4 Business Plan.pdf", status: "viewing", color: "#ec4899" },
                { user: "Jordan", device: "Desktop", object: "Product Roadmap", status: "editing", color: "#06b6d4" },
              ].map((p, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/30">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-foreground" style={{ backgroundColor: p.color }}>
                      {p.user[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{p.user}</p>
                      <p className="text-xs text-muted-foreground">{p.device} · {p.object}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={cn("text-xs capitalize",
                    p.status === "editing" ? "text-emerald-400 border-emerald-400/30" : "text-blue-400 border-blue-400/30"
                  )}>
                    {p.status}
                  </Badge>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3 text-center">
              3 users active across 2 objects
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
