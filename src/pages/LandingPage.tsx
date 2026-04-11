import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Shield, Brain, Wallet, Briefcase, Sparkles, Receipt, Lock, Eye } from "lucide-react";

const LandingPage = React.forwardRef<HTMLDivElement>((props, ref) => {
  const { signInAsDemo } = useAuth();

  return (
    <div ref={ref} className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Nav */}
      <header className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5 border-b border-border/40">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Brain className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">SITA OS</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" size="sm">Sign In</Button>
          </Link>
          <Link to="/signup">
            <Button size="sm">Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-20 pb-16 md:pt-32 md:pb-24 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border/60 bg-muted/50 text-xs text-muted-foreground mb-6">
          <Shield className="h-3 w-3" />
          Receipt-first · Policy-governed · Privacy-safe
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight mb-5">
          Your Sovereign
          <br />
          <span className="text-primary">AI Operating System</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
          SITA OS orchestrates your business, finances, and life through AI advisors that execute with trust, receipts, and full transparency.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link to="/signup">
            <Button size="lg" className="gap-2 px-8">
              <Sparkles className="h-4 w-4" /> Get Started
            </Button>
          </Link>
          <Button size="lg" variant="outline" onClick={signInAsDemo} className="gap-2 px-8">
            <Eye className="h-4 w-4" /> Try Demo
          </Button>
        </div>
      </section>

      {/* Value Props */}
      <section className="relative z-10 px-6 md:px-12 pb-20 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Briefcase,
              title: "Business OS",
              description: "CRM, leads, invoices, revenue autopilot, and AI-driven customer intelligence — all governed by your policies.",
            },
            {
              icon: Wallet,
              title: "Finance OS",
              description: "Cashflow forecasting, tax estimation, burn rate analysis, and safe-to-spend — with every calculation receipted.",
            },
            {
              icon: Brain,
              title: "Concierge OS",
              description: "AI advisors that learn your preferences, execute within trust boundaries, and explain every decision they make.",
            },
          ].map(({ icon: Icon, title, description }) => (
            <Card key={title} className="bg-card/60 backdrop-blur border-border/40 hover:border-primary/30 transition-colors">
              <CardContent className="p-6 flex flex-col gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Trust indicators */}
      <section className="relative z-10 border-t border-border/40 py-12 px-6">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
          {[
            { icon: Receipt, label: "Every action receipted" },
            { icon: Shield, label: "Policy-governed execution" },
            { icon: Lock, label: "Your data stays yours" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-primary/70" />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/40 py-6 px-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} SITA OS. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage;
