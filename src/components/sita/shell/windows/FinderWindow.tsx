// ═══════════════════════════════════════════════════════════════
// Finder Window — Refactored to use Nova SDK components
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { ICON_GRADIENTS } from "@/lib/design-system/nova-os";
import { Folder, Image, Music, AppWindow, Code, StickyNote, ChevronRight, Monitor, FileText, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppStateWrapper } from "@/components/sita/shell/AppStateWrapper";
import { AppLayout } from "@/lib/nova-sdk/ui/layout";
import { NovaList, NovaSectionLabel, NovaText, NovaCard, NovaToolbar } from "@/lib/nova-sdk/ui/components";
import { VStack, HStack } from "@/lib/nova-sdk/ui/layout";

const folders = [
  { label: "Docs", icon: Folder, gradient: ICON_GRADIENTS.blue },
  { label: "Images", icon: Image, gradient: ICON_GRADIENTS.purple },
  { label: "Music", icon: Music, gradient: ICON_GRADIENTS.pink },
  { label: "Apps", icon: AppWindow, gradient: ICON_GRADIENTS.green },
  { label: "Projects", icon: Code, gradient: ICON_GRADIENTS.orange },
  { label: "Notes", icon: StickyNote, gradient: ICON_GRADIENTS.gold },
];

const favorites = [
  { id: "Desktop", label: "Desktop", icon: <Monitor className="h-3.5 w-3.5" /> },
  { id: "Documents", label: "Documents", icon: <FileText className="h-3.5 w-3.5" /> },
  { id: "Downloads", label: "Downloads", icon: <Download className="h-3.5 w-3.5" /> },
];

export function FinderWindow() {
  const [activeFav, setActiveFav] = useState("Desktop");
  const [path, setPath] = useState(["Home"]);

  const sidebar = (
    <VStack spacing="tight">
      <NovaSectionLabel>Favorites</NovaSectionLabel>
      <NovaList
        items={favorites}
        activeId={activeFav}
        onSelect={(id) => { setActiveFav(id); setPath(["Home", id]); }}
      />
    </VStack>
  );

  const breadcrumb = (
    <HStack spacing="micro">
      {path.map((seg, i) => (
        <HStack spacing="micro" key={i}>
          {i > 0 && <ChevronRight className="h-2.5 w-2.5 text-[hsl(0_0%_50%)]" />}
          <button
            onClick={() => setPath(path.slice(0, i + 1))}
            className={cn(
              "text-[11px] font-medium tracking-wider transition-colors duration-[80ms] cursor-default",
              i === path.length - 1
                ? "text-[hsl(0_0%_20%)] dark:text-[hsl(0_0%_80%)]"
                : "text-[hsl(0_0%_50%)] hover:text-[hsl(0_0%_30%)] dark:hover:text-[hsl(0_0%_70%)]"
            )}
          >
            {seg}
          </button>
        </HStack>
      ))}
    </HStack>
  );

  const toolbar = <NovaToolbar leading={breadcrumb} />;

  return (
    <AppStateWrapper state="ready" accentGradient="from-[hsl(210_80%_60%)] to-[hsl(250_70%_55%)]">
      <AppLayout sidebar={sidebar} sidebarWidth={144} toolbar={toolbar}>
        <div className="grid grid-cols-3 gap-2">
          {folders.map(({ label, icon: Icon, gradient }) => (
            <NovaCard
              key={label}
              hoverable
              onClick={() => setPath([...path, label])}
              className="cursor-default active:scale-[0.97] transition-all duration-[80ms]"
            >
              <VStack align="center" spacing="micro" className="py-2">
                <div className={cn(
                  "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center",
                  "shadow-[0_2px_8px_hsl(0_0%_0%/0.12)]",
                  gradient
                )}>
                  <Icon className="h-5 w-5 text-[hsl(0_0%_100%/0.9)]" />
                </div>
                <NovaText variant="label">{label}</NovaText>
              </VStack>
            </NovaCard>
          ))}
        </div>
      </AppLayout>
    </AppStateWrapper>
  );
}
