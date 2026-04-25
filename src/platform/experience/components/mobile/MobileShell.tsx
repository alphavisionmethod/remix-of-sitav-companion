import { ReactNode } from "react";
import { MobileTabBar } from "./MobileTabBar";
import { Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface MobileShellProps {
  title: string;
  children: ReactNode;
}

export const MobileShell = ({ title, children }: MobileShellProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Compact header */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 py-3 border-b border-border/40 bg-card/90 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-primary/20 flex items-center justify-center">
            <span className="text-xs font-bold text-primary">S</span>
          </div>
          <h1 className="text-base font-semibold tracking-tight">{title}</h1>
        </div>
        <button
          onClick={() => navigate("/mobile/settings")}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <Settings className="h-4 w-4 text-muted-foreground" />
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-20 px-4 py-4">
        {children}
      </main>

      <MobileTabBar />
    </div>
  );
};
