// ═══════════════════════════════════════════════════════════════
// Finder Window — Wired to FileSystemService VFS
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useMemo } from "react";
import { ICON_GRADIENTS } from "@/lib/design-system/nova-os";
import {
  Folder, Image, Music, AppWindow, Code, StickyNote, ChevronRight,
  Monitor, FileText, Download, File, HardDrive, ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AppStateWrapper } from "@/components/sita/shell/AppStateWrapper";
import { AppLayout } from "@/lib/nova-sdk/ui/layout";
import { NovaList, NovaSectionLabel, NovaText, NovaCard, NovaToolbar, NovaBadge } from "@/lib/nova-sdk/ui/components";
import { VStack, HStack, Divider } from "@/lib/nova-sdk/ui/layout";
import { FileSystemService, type FSNode, type MountPoint } from "@/lib/nova-sdk/services/filesystem-service";

// ── Icon helpers ─────────────────────────────────────────────

const DIR_ICON_MAP: Record<string, { icon: typeof Folder; gradient: string }> = {
  Desktop:   { icon: Monitor,    gradient: ICON_GRADIENTS.blue },
  Documents: { icon: FileText,   gradient: ICON_GRADIENTS.blue },
  Downloads: { icon: Download,   gradient: ICON_GRADIENTS.green },
  Pictures:  { icon: Image,      gradient: ICON_GRADIENTS.purple },
  Music:     { icon: Music,      gradient: ICON_GRADIENTS.pink },
  Projects:  { icon: Code,       gradient: ICON_GRADIENTS.orange },
  Apps:      { icon: AppWindow,   gradient: ICON_GRADIENTS.green },
  Notes:     { icon: StickyNote,  gradient: ICON_GRADIENTS.gold },
  ".trash":  { icon: Folder,      gradient: ICON_GRADIENTS.orange },
};

function iconForNode(node: FSNode) {
  if (node.type === "directory") {
    const mapped = DIR_ICON_MAP[node.name];
    return {
      Icon: mapped?.icon || Folder,
      gradient: mapped?.gradient || ICON_GRADIENTS.blue,
    };
  }
  // Files — pick icon by MIME
  if (node.mime.startsWith("image/")) return { Icon: Image, gradient: ICON_GRADIENTS.purple };
  if (node.mime.startsWith("audio/")) return { Icon: Music, gradient: ICON_GRADIENTS.pink };
  if (node.mime.startsWith("text/")) return { Icon: FileText, gradient: ICON_GRADIENTS.blue };
  if (node.mime.includes("javascript") || node.mime.includes("typescript"))
    return { Icon: Code, gradient: ICON_GRADIENTS.orange };
  return { Icon: File, gradient: ICON_GRADIENTS.blue };
}

function formatSize(bytes: number): string {
  if (bytes === 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

// ── Sidebar Favorites (derived from VFS) ─────────────────────

const FAVORITE_PATHS = [
  { path: "/home/Desktop",   label: "Desktop",   icon: <Monitor className="h-3.5 w-3.5" /> },
  { path: "/home/Documents", label: "Documents", icon: <FileText className="h-3.5 w-3.5" /> },
  { path: "/home/Downloads", label: "Downloads", icon: <Download className="h-3.5 w-3.5" /> },
  { path: "/home/Pictures",  label: "Pictures",  icon: <Image className="h-3.5 w-3.5" /> },
  { path: "/home/Music",     label: "Music",     icon: <Music className="h-3.5 w-3.5" /> },
];

// ── Main Component ───────────────────────────────────────────

export function FinderWindow() {
  const [currentPath, setCurrentPath] = useState("/home");
  const [entries, setEntries] = useState<FSNode[]>([]);
  const [mounts, setMounts] = useState<MountPoint[]>([]);

  // Read directory from VFS
  const refreshDir = useCallback((path: string) => {
    const items = FileSystemService.listDir(path);
    // Sort: dirs first, then alphabetical
    items.sort((a, b) => {
      if (a.type !== b.type) return a.type === "directory" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    setEntries(items);
  }, []);

  // Load mounts once
  useEffect(() => {
    setMounts(FileSystemService.getMounts());
  }, []);

  // Refresh on path change + watch for changes
  useEffect(() => {
    refreshDir(currentPath);
    const unwatch = FileSystemService.watch(currentPath, () => refreshDir(currentPath));
    return unwatch;
  }, [currentPath, refreshDir]);

  const navigateTo = useCallback((path: string) => {
    setCurrentPath(path);
  }, []);

  const goUp = useCallback(() => {
    if (currentPath === "/") return;
    const parent = currentPath.substring(0, currentPath.lastIndexOf("/")) || "/";
    setCurrentPath(parent);
  }, [currentPath]);

  // Breadcrumb segments
  const pathSegments = useMemo(() => {
    if (currentPath === "/") return [{ label: "/", path: "/" }];
    const parts = currentPath.split("/").filter(Boolean);
    return [
      { label: "/", path: "/" },
      ...parts.map((p, i) => ({
        label: p,
        path: "/" + parts.slice(0, i + 1).join("/"),
      })),
    ];
  }, [currentPath]);

  // Active favorite
  const activeFav = FAVORITE_PATHS.find(f => f.path === currentPath)?.path || "";

  // ── Sidebar ──

  const sidebar = (
    <VStack spacing="tight" className="h-full">
      <NovaSectionLabel>Favorites</NovaSectionLabel>
      <NovaList
        items={FAVORITE_PATHS.map(f => ({ id: f.path, label: f.label, icon: f.icon }))}
        activeId={activeFav}
        onSelect={(id) => navigateTo(id)}
      />

      <NovaSectionLabel className="mt-3">Volumes</NovaSectionLabel>
      <NovaList
        items={mounts.map(m => ({
          id: m.path,
          label: m.label,
          icon: <HardDrive className="h-3.5 w-3.5" />,
        }))}
        activeId={mounts.find(m => currentPath.startsWith(m.path))?.path || ""}
        onSelect={(id) => navigateTo(id)}
      />
    </VStack>
  );

  // ── Breadcrumb Toolbar ──

  const breadcrumb = (
    <HStack spacing="micro" align="center">
      <button
        onClick={goUp}
        disabled={currentPath === "/"}
        className="p-0.5 rounded hover:bg-[hsl(0_0%_50%/0.1)] disabled:opacity-30 transition-colors"
      >
        <ChevronLeft className="h-3.5 w-3.5 text-[hsl(0_0%_50%)]" />
      </button>
      {pathSegments.map((seg, i) => (
        <HStack spacing="micro" key={seg.path}>
          {i > 0 && <ChevronRight className="h-2.5 w-2.5 text-[hsl(0_0%_50%)]" />}
          <button
            onClick={() => navigateTo(seg.path)}
            className={cn(
              "text-[11px] font-medium tracking-wider transition-colors duration-[80ms] cursor-default",
              i === pathSegments.length - 1
                ? "text-[hsl(0_0%_20%)] dark:text-[hsl(0_0%_80%)]"
                : "text-[hsl(0_0%_50%)] hover:text-[hsl(0_0%_30%)] dark:hover:text-[hsl(0_0%_70%)]"
            )}
          >
            {seg.label}
          </button>
        </HStack>
      ))}
    </HStack>
  );

  const toolbar = (
    <NovaToolbar
      leading={breadcrumb}
      trailing={
        <NovaText variant="label" muted className="!text-[10px]">
          {entries.length} item{entries.length !== 1 ? "s" : ""}
        </NovaText>
      }
    />
  );

  // ── Content Grid ──

  return (
    <AppStateWrapper state="ready" accentGradient="from-[hsl(210_80%_60%)] to-[hsl(250_70%_55%)]">
      <AppLayout sidebar={sidebar} sidebarWidth={152} toolbar={toolbar}>
        {entries.length === 0 ? (
          <VStack align="center" spacing="tight" className="py-12 opacity-50">
            <Folder className="h-10 w-10 text-muted-foreground" />
            <NovaText variant="label" muted>Empty folder</NovaText>
          </VStack>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {entries.map((node) => {
              const { Icon, gradient } = iconForNode(node);
              return (
                <NovaCard
                  key={node.path}
                  hoverable
                  onClick={() => {
                    if (node.type === "directory") navigateTo(node.path);
                  }}
                  className={cn(
                    "cursor-default active:scale-[0.97] transition-all duration-[80ms]",
                    node.type === "directory" && "cursor-pointer"
                  )}
                >
                  <VStack align="center" spacing="micro" className="py-2">
                    <div className={cn(
                      "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center",
                      "shadow-[0_2px_8px_hsl(0_0%_0%/0.12)]",
                      gradient
                    )}>
                      <Icon className="h-5 w-5 text-[hsl(0_0%_100%/0.9)]" />
                    </div>
                    <NovaText variant="label" className="truncate max-w-full text-center">
                      {node.name}
                    </NovaText>
                    {node.type === "file" && (
                      <NovaText variant="label" muted className="!text-[9px]">
                        {formatSize(node.size)}
                      </NovaText>
                    )}
                  </VStack>
                </NovaCard>
              );
            })}
          </div>
        )}
      </AppLayout>
    </AppStateWrapper>
  );
}
