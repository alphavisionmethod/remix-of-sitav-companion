// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin Command Palette (Phase 2 — Registry Driven)
// Cmd/Ctrl-K palette. Lists ONLY routes registered in
// admin-route-registry, grouped by canonical domain. Deprecated
// and merged routes are intentionally excluded so the palette
// always points operators at the canonical destination.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Home,
  AlertTriangle,
  CheckSquare,
  Users,
  Brain,
  Plug,
  ShieldCheck,
  Activity,
  Rocket,
  FileSearch,
  Settings as SettingsIcon,
  LifeBuoy,
  RefreshCw,
  FileText,
  Search,
  Workflow,
} from "lucide-react";
import {
  ADMIN_DOMAINS,
  ADMIN_ROUTE_REGISTRY,
  DOMAIN_LABELS,
  type AdminDomain,
  type AdminRouteEntry,
} from "@/platform/architecture/admin-route-registry";
import { getAllWorkflows } from "@/platform/architecture/owner-workflow-map";

const ACTIVE_WORKFLOW_STORAGE_KEY = "sita.admin.activeWorkflow";

const DOMAIN_ICONS: Record<AdminDomain, React.ElementType> = {
  overview: Home,
  alerts: AlertTriangle,
  approvals: CheckSquare,
  environments: Users,
  "ai-runtime": Brain,
  integrations: Plug,
  "trust-security": ShieldCheck,
  health: Activity,
  releases: Rocket,
  verification: FileSearch,
  config: SettingsIcon,
  support: LifeBuoy,
};

const ACTION_ITEMS = [
  { label: "Refresh Platform State", action: "refresh", icon: RefreshCw },
  { label: "Export Evidence Bundle", action: "export", icon: FileText },
  { label: "Run Diagnostics", action: "diagnostics", icon: Search },
  { label: "Open Settings", action: "settings", icon: SettingsIcon },
];

function entryLabel(e: AdminRouteEntry): string {
  return e.breadcrumb.join(" › ");
}

export function AdminCommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleNavSelect = useCallback(
    (path: string) => {
      setOpen(false);
      navigate(path);
    },
    [navigate],
  );

  const handleActionSelect = useCallback(
    (action: string) => {
      setOpen(false);
      if (action === "refresh") window.location.reload();
      if (action === "settings") navigate("/settings");
    },
    [navigate],
  );

  // Group registry entries by canonical domain. Exclude deprecated /
  // duplicate-merge entries so operators never land on a stale page.
  const grouped = useMemo(() => {
    const map = new Map<AdminDomain, AdminRouteEntry[]>();
    for (const d of ADMIN_DOMAINS) map.set(d, []);
    for (const e of ADMIN_ROUTE_REGISTRY) {
      if (e.nav === "deprecated" || e.nav === "hidden") continue;
      if (e.pageClass === "DEPRECATE_WITH_REDIRECT") continue;
      if (e.pageClass === "DUPLICATE_MERGE_REQUIRED") continue;
      map.get(e.domain)!.push(e);
    }
    // Sort each group: primary hub first, then subnav, then explorers.
    const order = { primary: 0, subnav: 1, explorer: 2, hidden: 3, deprecated: 4 } as const;
    for (const [, entries] of map) {
      entries.sort((a, b) => {
        const oa = order[a.nav] ?? 99;
        const ob = order[b.nav] ?? 99;
        if (oa !== ob) return oa - ob;
        return a.breadcrumb.length - b.breadcrumb.length;
      });
    }
    return map;
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search admin routes…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Workflows">
          {getAllWorkflows().map((wf) => (
            <CommandItem
              key={wf.key}
              value={`Workflow ${wf.label} ${wf.description} ${wf.entry}`}
              onSelect={() => {
                try {
                  sessionStorage.setItem(ACTIVE_WORKFLOW_STORAGE_KEY, wf.key);
                } catch {
                  // Ignore storage errors
                }
                handleNavSelect(wf.entry);
              }}
              className="cursor-pointer"
            >
              <Workflow className="mr-2 h-4 w-4 text-primary" />
              <span className="font-medium">{wf.label}</span>
              <span className="ml-2 text-[10px] text-muted-foreground truncate">
                {wf.description}
              </span>
              <span className="ml-auto text-[10px] text-muted-foreground/60 font-mono">
                {wf.steps.length} steps
              </span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        {ADMIN_DOMAINS.map((domain) => {
          const entries = grouped.get(domain) ?? [];
          if (entries.length === 0) return null;
          const Icon = DOMAIN_ICONS[domain];
          return (
            <CommandGroup key={domain} heading={DOMAIN_LABELS[domain]}>
              {entries.map((e) => (
                <CommandItem
                  key={e.path}
                  value={`${DOMAIN_LABELS[domain]} ${entryLabel(e)} ${e.path}`}
                  onSelect={() => handleNavSelect(e.path)}
                  className="cursor-pointer"
                >
                  <Icon className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{entryLabel(e)}</span>
                  <span className="ml-auto text-[10px] text-muted-foreground/60 font-mono">
                    {e.path}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          );
        })}

        <CommandSeparator />

        <CommandGroup heading="Actions">
          {ACTION_ITEMS.map((item) => (
            <CommandItem
              key={item.action}
              onSelect={() => handleActionSelect(item.action)}
              className="cursor-pointer"
            >
              <item.icon className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{item.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
