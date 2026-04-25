import { cn } from "@/lib/utils";

interface SitaPageHeaderProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children?: React.ReactNode;
}

export function SitaPageHeader({ icon, title, subtitle, children }: SitaPageHeaderProps) {
  return (
    <div role="banner" className="rounded-2xl border border-border/40 bg-gradient-to-br from-primary/5 via-card to-card p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm shrink-0">
            {icon}
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">{title}</h1>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
