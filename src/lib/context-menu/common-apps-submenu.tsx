// ═══════════════════════════════════════════════════════════════
// SITA OS — Common Apps submenu
// Lists installed apps for quick launch from a context menu.
// ═══════════════════════════════════════════════════════════════

import { useInstalledApps } from "@/platform/app-platform/hooks/use-app-platform";
import {
  ContextMenuItem,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from "@/components/ui/context-menu";
import { AppWindow } from "lucide-react";

const PRIORITY_APPS = [
  "files",
  "mail",
  "calendar",
  "notes",
  "calculator",
  "browser",
  "settings",
];

export function CommonAppsSubmenu() {
  const { data: installed = [] } = useInstalledApps();

  // Sort: priority list first (in order), then the rest alphabetically by app_id.
  const sorted = [...installed].sort((a, b) => {
    const ai = PRIORITY_APPS.indexOf(a.app_id);
    const bi = PRIORITY_APPS.indexOf(b.app_id);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return a.app_id.localeCompare(b.app_id);
  });

  const launch = (appId: string) => {
    window.dispatchEvent(new CustomEvent("sita-open-app", { detail: { appId } }));
  };

  return (
    <ContextMenuSub>
      <ContextMenuSubTrigger>
        <AppWindow className="mr-2 h-4 w-4" />
        Common Apps
      </ContextMenuSubTrigger>
      <ContextMenuSubContent className="min-w-[180px] max-h-80 overflow-y-auto">
        {sorted.length === 0 ? (
          <ContextMenuItem disabled>No apps installed</ContextMenuItem>
        ) : (
          sorted.slice(0, 16).map((app) => (
            <ContextMenuItem key={app.app_id} onSelect={() => launch(app.app_id)}>
              {app.app_id.charAt(0).toUpperCase() + app.app_id.slice(1).replace(/-/g, " ")}
            </ContextMenuItem>
          ))
        )}
      </ContextMenuSubContent>
    </ContextMenuSub>
  );
}
