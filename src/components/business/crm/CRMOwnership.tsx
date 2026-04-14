// SITA OS — CRM Ownership Component
// Record ownership, assignment, and access control display
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User, Users, Shield, Clock, Eye, Edit2, Crown,
  ArrowRight, History, CheckCircle, AlertTriangle, Sparkles, Lock
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

interface OwnershipRecord {
  id: string;
  owner: { name: string; role: string; avatar?: string };
  assigned_at: string;
  assigned_by: string;
  reason?: string;
}

interface AccessEntry {
  user: string;
  level: "owner" | "editor" | "viewer" | "advisor";
  last_access: string;
}

interface OwnershipChange {
  from: string;
  to: string;
  changed_at: string;
  changed_by: string;
  reason: string;
}

const LEVEL_CONFIG: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
  owner: { label: "Owner", icon: <Crown className="h-3 w-3" />, className: "bg-primary/15 text-primary border-primary/25" },
  editor: { label: "Editor", icon: <Edit2 className="h-3 w-3" />, className: "bg-blue-500/15 text-blue-400 border-blue-500/25" },
  viewer: { label: "Viewer", icon: <Eye className="h-3 w-3" />, className: "bg-muted text-muted-foreground border-border/50" },
  advisor: { label: "AI Advisor", icon: <Sparkles className="h-3 w-3" />, className: "bg-purple-500/15 text-purple-400 border-purple-500/25" },
};

function generateDemoOwnership(): {
  current: OwnershipRecord;
  access: AccessEntry[];
  history: OwnershipChange[];
} {
  return {
    current: {
      id: "own-1",
      owner: { name: "You", role: "Account Executive" },
      assigned_at: "2025-09-01T10:00:00Z",
      assigned_by: "System",
      reason: "Auto-assigned on creation",
    },
    access: [
      { user: "You", level: "owner", last_access: "2026-04-14T08:30:00Z" },
      { user: "Relationship Advisor", level: "advisor", last_access: "2026-04-13T16:00:00Z" },
      { user: "Follow-Through Advisor", level: "advisor", last_access: "2026-04-12T09:00:00Z" },
    ],
    history: [
      { from: "Unassigned", to: "You", changed_at: "2025-09-01T10:00:00Z", changed_by: "System", reason: "Auto-assigned during import" },
    ],
  };
}

interface CRMOwnershipProps {
  entityType: "contact" | "company" | "deal";
  entityId: string;
  entityName: string;
  currentOwner?: string;
}

export function CRMOwnership({ entityType, entityId, entityName, currentOwner }: CRMOwnershipProps) {
  const data = generateDemoOwnership();

  return (
    <div className="space-y-4">
      {/* Current Owner */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Crown className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">{data.current.owner.name}</p>
              <p className="text-xs text-muted-foreground">{data.current.owner.role}</p>
              <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                Since {format(new Date(data.current.assigned_at), "MMM d, yyyy")} · {data.current.reason}
              </p>
            </div>
            <Button variant="outline" size="sm" className="text-xs gap-1 h-7">
              <Users className="h-3 w-3" /> Reassign
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Access List */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" /> Access & Visibility
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {data.access.map((entry, i) => {
            const cfg = LEVEL_CONFIG[entry.level];
            return (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/10 border border-border/30">
                <div className="w-8 h-8 rounded-full bg-muted/30 flex items-center justify-center">
                  {cfg.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{entry.user}</p>
                  <p className="text-[10px] text-muted-foreground">Last access {formatDistanceToNow(new Date(entry.last_access), { addSuffix: true })}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium flex items-center gap-1 ${cfg.className}`}>
                  {cfg.icon} {cfg.label}
                </span>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Ownership History */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <History className="h-4 w-4 text-primary" /> Ownership History
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {data.history.map((change, i) => (
            <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg bg-muted/10 border border-border/30">
              <div className="mt-0.5">
                <ArrowRight className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-muted-foreground line-through">{change.from}</span>
                  <ArrowRight className="h-2.5 w-2.5 text-muted-foreground" />
                  <span className="font-medium text-foreground">{change.to}</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {format(new Date(change.changed_at), "MMM d, yyyy")} · by {change.changed_by} · {change.reason}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Security note */}
      <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/20 border border-border/30">
        <Lock className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          All access and changes to this {entityType} are logged in the proof trail. Ownership changes require appropriate permissions and are immutably recorded.
        </p>
      </div>
    </div>
  );
}
