// ═══════════════════════════════════════════════════════════════
// SITA OS — Permission-Gated Command Palette
// Wraps cmdk with per-command permission enforcement.
// Commands like simulate/explain only appear with required scopes.
// ═══════════════════════════════════════════════════════════════

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  CommandDialog, Command, CommandInput, CommandList, CommandEmpty,
  CommandGroup, CommandItem, CommandShortcut, CommandSeparator,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import {
  Search, Beaker, Eye, Brain, Shield, Send, Settings, Users,
  BarChart3, FileText, Zap, Lock, AlertTriangle, Sparkles,
} from "lucide-react";
import { usePermissionGate, type PermissionScope } from "@/hooks/usePermissionGate";
import { cn } from "@/lib/utils";

// ── Command Registry ───────────────────────────────────────────

export interface PaletteCommand {
  id: string;
  label: string;
  description?: string;
  group: string;
  icon?: React.ReactNode;
  shortcut?: string;
  requiredPermissions?: PermissionScope[];
  requireAny?: boolean; // true = any permission suffices, false = all required
  onExecute: () => void;
  keywords?: string[];
  destructive?: boolean;
}

interface GatedCommandPaletteProps {
  commands: PaletteCommand[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hotkey?: string;
}

// ── Component ──────────────────────────────────────────────────

export function GatedCommandPalette({
  commands,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  hotkey = "k",
}: GatedCommandPaletteProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = controlledOnOpenChange ?? setInternalOpen;

  const { hasPermission, hasAny, hasAll, isLoading } = usePermissionGate();

  // Hotkey listener
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === hotkey && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, setOpen, hotkey]);

  // Filter commands by permission
  const visibleCommands = useMemo(() => {
    if (isLoading) return [];
    return commands.filter(cmd => {
      if (!cmd.requiredPermissions || cmd.requiredPermissions.length === 0) return true;
      return cmd.requireAny
        ? hasAny(...cmd.requiredPermissions)
        : hasAll(...cmd.requiredPermissions);
    });
  }, [commands, isLoading, hasAny, hasAll]);

  // Group commands
  const groups = useMemo(() => {
    const map = new Map<string, PaletteCommand[]>();
    for (const cmd of visibleCommands) {
      const list = map.get(cmd.group) ?? [];
      list.push(cmd);
      map.set(cmd.group, list);
    }
    return map;
  }, [visibleCommands]);

  // Count gated (hidden) commands for transparency
  const hiddenCount = commands.length - visibleCommands.length;

  const handleSelect = useCallback((cmd: PaletteCommand) => {
    setOpen(false);
    // Slight delay so dialog closes before action
    requestAnimationFrame(() => cmd.onExecute());
  }, [setOpen]);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search…" />
      <CommandList>
        <CommandEmpty>
          <div className="flex flex-col items-center gap-2 py-4">
            <Search className="h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">No commands found.</p>
            {hiddenCount > 0 && (
              <p className="text-[10px] text-muted-foreground/70 flex items-center gap-1">
                <Lock className="h-3 w-3" /> {hiddenCount} command(s) require additional permissions
              </p>
            )}
          </div>
        </CommandEmpty>

        {Array.from(groups.entries()).map(([groupName, cmds], gi) => (
          <React.Fragment key={groupName}>
            {gi > 0 && <CommandSeparator />}
            <CommandGroup heading={groupName}>
              {cmds.map(cmd => (
                <CommandItem
                  key={cmd.id}
                  value={[cmd.label, ...(cmd.keywords ?? [])].join(" ")}
                  onSelect={() => handleSelect(cmd)}
                  className={cn(cmd.destructive && "text-destructive")}
                >
                  <span className="mr-2 flex h-5 w-5 items-center justify-center">
                    {cmd.icon ?? <Zap className="h-4 w-4" />}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm">{cmd.label}</span>
                    {cmd.description && (
                      <span className="ml-2 text-xs text-muted-foreground">{cmd.description}</span>
                    )}
                  </div>
                  {cmd.requiredPermissions && cmd.requiredPermissions.length > 0 && (
                    <Badge variant="outline" className="text-[9px] ml-2 gap-0.5 border-border/50 text-muted-foreground">
                      <Shield className="h-2.5 w-2.5" /> gated
                    </Badge>
                  )}
                  {cmd.shortcut && <CommandShortcut>{cmd.shortcut}</CommandShortcut>}
                </CommandItem>
              ))}
            </CommandGroup>
          </React.Fragment>
        ))}

        {/* Transparency footer */}
        {hiddenCount > 0 && (
          <>
            <CommandSeparator />
            <div className="flex items-center justify-center gap-1.5 py-2 text-[10px] text-muted-foreground/60">
              <Lock className="h-3 w-3" />
              {hiddenCount} command(s) hidden — insufficient permissions
            </div>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}

// ── Default Command Set Factory ────────────────────────────────

export function createDefaultCommands(handlers: {
  onSimulate?: () => void;
  onExplain?: () => void;
  onBoardroom?: () => void;
  onSettings?: () => void;
  onSearch?: () => void;
  onViewReceipts?: () => void;
  onAdminPanel?: () => void;
}): PaletteCommand[] {
  return [
    {
      id: "search",
      label: "Search everything",
      group: "General",
      icon: <Search className="h-4 w-4" />,
      shortcut: "⌘F",
      onExecute: handlers.onSearch ?? (() => {}),
    },
    {
      id: "settings",
      label: "Open Settings",
      group: "General",
      icon: <Settings className="h-4 w-4" />,
      onExecute: handlers.onSettings ?? (() => {}),
    },
    {
      id: "simulate",
      label: "Run Simulation",
      description: "Monte Carlo scenario analysis",
      group: "Intelligence",
      icon: <Beaker className="h-4 w-4" />,
      requiredPermissions: ["simulate.run"],
      onExecute: handlers.onSimulate ?? (() => {}),
      keywords: ["monte carlo", "scenario", "what if"],
    },
    {
      id: "simulate-view",
      label: "View Simulations",
      description: "Browse past simulation results",
      group: "Intelligence",
      icon: <BarChart3 className="h-4 w-4" />,
      requiredPermissions: ["simulate.view"],
      onExecute: handlers.onSimulate ?? (() => {}),
      keywords: ["results", "past"],
    },
    {
      id: "explain",
      label: "Explain Decision",
      description: "View AI reasoning chain",
      group: "Intelligence",
      icon: <Eye className="h-4 w-4" />,
      requiredPermissions: ["explain.view"],
      onExecute: handlers.onExplain ?? (() => {}),
      keywords: ["reasoning", "why", "tradeoff"],
    },
    {
      id: "boardroom",
      label: "Open Boardroom",
      description: "Strategic multi-advisor session",
      group: "Intelligence",
      icon: <Brain className="h-4 w-4" />,
      requiredPermissions: ["boardroom.intake"],
      onExecute: handlers.onBoardroom ?? (() => {}),
      keywords: ["advisors", "strategy", "council"],
    },
    {
      id: "receipts",
      label: "View Receipts",
      description: "AI action audit trail",
      group: "Audit",
      icon: <FileText className="h-4 w-4" />,
      requiredPermissions: ["audit.view"],
      onExecute: handlers.onViewReceipts ?? (() => {}),
      keywords: ["proof", "audit", "log"],
    },
    {
      id: "admin",
      label: "Admin Panel",
      description: "System administration",
      group: "Admin",
      icon: <Shield className="h-4 w-4" />,
      requiredPermissions: ["admin.recovery"],
      onExecute: handlers.onAdminPanel ?? (() => {}),
      keywords: ["operator", "recovery", "maintenance"],
      destructive: false,
    },
  ];
}