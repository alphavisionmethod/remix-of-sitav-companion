import { NavLink } from "react-router-dom";
import { Network, Terminal, Shield, FileCheck, Brain } from "lucide-react";

const links = [
  { to: "/admin/ecosystem/command", label: "Command Center", icon: Terminal },
] as const;

export function ECOSubNav() {
  return (
    <nav className="flex items-center gap-1 mb-6 overflow-x-auto pb-1">
      {links.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          className={({ isActive }) =>
            `flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`
          }
        >
          <l.icon className="h-3.5 w-3.5" />
          {l.label}
        </NavLink>
      ))}
    </nav>
  );
}
