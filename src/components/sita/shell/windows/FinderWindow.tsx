import { ICON_GRADIENTS } from "@/lib/design-system/nova-os";
import { Folder, Image, Music, AppWindow, Code, StickyNote } from "lucide-react";

const folders = [
  { label: "Docs", icon: Folder, gradient: ICON_GRADIENTS.blue },
  { label: "Images", icon: Image, gradient: ICON_GRADIENTS.purple },
  { label: "Music", icon: Music, gradient: ICON_GRADIENTS.pink },
  { label: "Apps", icon: AppWindow, gradient: ICON_GRADIENTS.green },
  { label: "Projects", icon: Code, gradient: ICON_GRADIENTS.orange },
  { label: "Notes", icon: StickyNote, gradient: ICON_GRADIENTS.gold },
];

export function FinderWindow() {
  return (
    <div className="p-4 grid grid-cols-3 gap-4">
      {folders.map(({ label, icon: Icon, gradient }) => (
        <button
          key={label}
          className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-[hsl(0_0%_0%/0.04)] dark:hover:bg-[hsl(0_0%_100%/0.06)] transition-colors cursor-default"
        >
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} shadow flex items-center justify-center`}>
            <Icon className="h-6 w-6 text-[hsl(0_0%_100%/0.9)]" />
          </div>
          <span className="text-xs text-[hsl(0_0%_20%)] dark:text-[hsl(0_0%_80%)]">{label}</span>
        </button>
      ))}
    </div>
  );
}
