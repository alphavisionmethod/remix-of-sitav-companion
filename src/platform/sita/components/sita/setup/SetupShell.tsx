import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

interface SetupShellProps {
  children: React.ReactNode;
  className?: string;
  hideAmbient?: boolean;
}

export function SetupShell({ children, className, hideAmbient }: SetupShellProps) {
  const reduced = useReducedMotion();
  return (
    <div className={cn("fixed inset-0 z-[150] flex items-center justify-center overflow-y-auto p-4 sm:p-8", className)}
      style={{ backgroundColor: "#0B0D10" }}>
      {!hideAmbient && !reduced && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full blur-[120px]"
            style={{ background: "hsl(265 55% 58% / 0.04)" }} />
          <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full blur-[100px]"
            style={{ background: "hsl(38 85% 58% / 0.03)" }} />
        </div>
      )}
      <div className="relative z-10 flex items-start gap-6 w-full max-w-4xl 2xl:max-w-5xl justify-center">
        {children}
      </div>
    </div>
  );
}
