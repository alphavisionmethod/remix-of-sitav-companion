import { Link } from "react-router-dom";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/30 bg-card/30 mt-24">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 grid gap-10 md:grid-cols-4">
        <div className="space-y-3">
          <div className="text-base font-bold tracking-tight">SITA OS</div>
          <p className="text-sm text-muted-foreground max-w-xs">
            A sovereign, on-device operating system for owners. Receipt-first. Policy-governed. Yours.
          </p>
        </div>
        <FooterCol title="Product" links={[
          { to: "/demo", label: "Interactive demo" },
          { to: "/download", label: "Download" },
          { to: "/proof", label: "Proof wall" },
          { to: "/manifesto", label: "Manifesto" },
        ]} />
        <FooterCol title="Company" links={[
          { to: "/investors", label: "Investors" },
          { to: "/press", label: "Press kit" },
          { to: "/donate", label: "Donate" },
          { to: "/beta", label: "Beta program" },
        ]} />
        <FooterCol title="Legal" links={[
          { to: "/privacy", label: "Privacy" },
          { to: "/terms", label: "Terms" },
          { to: "/cookies", label: "Cookies" },
        ]} />
      </div>
      <div className="border-t border-border/30 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} SITA OS. Built in the open.
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { to: string; label: string }[] }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-3">{title}</div>
      <ul className="space-y-2 text-sm">
        {links.map((l) => (
          <li key={l.to}>
            <Link to={l.to} className="text-foreground/80 hover:text-foreground transition-colors">{l.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
