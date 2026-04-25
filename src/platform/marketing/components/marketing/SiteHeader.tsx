import { Link, NavLink } from "react-router-dom";
import { Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/demo", label: "Demo" },
  { to: "/beta", label: "Beta" },
  { to: "/waitlist", label: "Waitlist" },
  { to: "/investors", label: "Investors" },
  { to: "/donate", label: "Donate" },
  { to: "/download", label: "Download" },
  { to: "/manifesto", label: "Manifesto" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/30 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-8">
        <Link to="/" className="flex items-center gap-2.5 shrink-0" aria-label="SITA OS home">
          <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
            <Brain className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-base font-bold tracking-tight">SITA OS</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1 text-sm" aria-label="Primary">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                cn(
                  "px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors",
                  isActive && "text-foreground bg-muted/40"
                )
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/login" className="hidden sm:inline-flex">
            <Button variant="ghost" size="sm">Sign in</Button>
          </Link>
          <Link to="/waitlist">
            <Button size="sm" className="rounded-xl px-4">Join waitlist</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
