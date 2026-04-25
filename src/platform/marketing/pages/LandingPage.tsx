import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Shield, Brain, Wallet, Briefcase, Sparkles, Receipt, Lock, Eye, ArrowRight } from "lucide-react";
import { motion, useInView } from "framer-motion";

import heroBusinessAdvisor from "@/assets/promo/hero-business-advisor.jpg";
import heroMoneyAdvisor from "@/assets/promo/hero-money-advisor.jpg";
import heroConciergeAdvisor from "@/assets/promo/hero-concierge-advisor.jpg";

const spring = { type: "spring", mass: 1, stiffness: 100, damping: 15 };

const FadeInSection = React.forwardRef<HTMLDivElement, { children: React.ReactNode; className?: string; delay?: number }>(
  ({ children, className, delay = 0 }, forwardedRef) => {
    const localRef = useRef<HTMLDivElement>(null);
    const inView = useInView(localRef, { once: true, margin: "-60px" });
    return (
      <motion.div
        ref={(node) => {
          (localRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          if (typeof forwardedRef === "function") forwardedRef(node);
          else if (forwardedRef) forwardedRef.current = node;
        }}
        initial={{ opacity: 0, y: 32 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ ...spring, delay }}
        className={className}
      >
        {children}
      </motion.div>
    );
  }
);
FadeInSection.displayName = "FadeInSection";

const LandingPage = React.forwardRef<HTMLDivElement>((props, ref) => {
  const { signInAsDemo } = useAuth();

  return (
    <div ref={ref} className="min-h-screen bg-background text-foreground overflow-hidden relative">
      {/* Cinematic ambient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[15%] left-[20%] w-[600px] h-[600px] rounded-full opacity-30"
          style={{ background: "radial-gradient(circle, hsl(265 55% 58% / 0.15) 0%, transparent 70%)", filter: "blur(80px)", animation: "orbFloat 20s ease-in-out infinite" }} />
        <div className="absolute bottom-[10%] right-[15%] w-[500px] h-[500px] rounded-full opacity-25"
          style={{ background: "radial-gradient(circle, hsl(38 85% 58% / 0.12) 0%, transparent 70%)", filter: "blur(80px)", animation: "orbFloat 25s ease-in-out infinite reverse" }} />
        <div className="absolute top-[50%] left-[60%] w-[400px] h-[400px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, hsl(152 55% 48% / 0.1) 0%, transparent 70%)", filter: "blur(80px)", animation: "orbFloat 18s ease-in-out infinite 5s" }} />
      </div>

      {/* Nav */}
      <header className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5 border-b border-border/20">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-primary/90 flex items-center justify-center shadow-glow-purple">
            <Brain className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight font-display">SITA OS</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">Sign In</Button>
          </Link>
          <Link to="/signup">
            <Button size="sm" className="rounded-xl px-5 shadow-glow-purple">Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-24 pb-20 md:pt-40 md:pb-32 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border/30 bg-card/50 backdrop-blur-xl text-xs text-muted-foreground mb-8"
        >
          <Shield className="h-3 w-3 text-primary" />
          Receipt-first · Policy-governed · Privacy-safe
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.2 }}
          className="text-5xl md:text-7xl font-bold tracking-[-0.03em] leading-[1.05] mb-6 font-display"
        >
          Your Sovereign
          <br />
          <span className="text-gradient-hero">AI Operating System</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.35 }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-12 leading-relaxed tracking-[-0.01em]"
        >
          SITA OS orchestrates your business, finances, and life through AI advisors that execute with trust, receipts, and full transparency.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <Link to="/signup">
            <Button size="lg" className="gap-2 px-8 rounded-2xl h-12 text-[15px] shadow-glow-purple hover:shadow-lg transition-shadow">
              <Sparkles className="h-4 w-4" /> Get Started
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
          <Button size="lg" variant="outline" onClick={signInAsDemo} className="gap-2 px-8 rounded-2xl h-12 text-[15px] border-border/40 backdrop-blur-xl">
            <Eye className="h-4 w-4" /> Try Demo
          </Button>
        </motion.div>
      </section>

      {/* Value Props — Frosted Glass Cards */}
      <section className="relative z-10 px-6 md:px-12 pb-24 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Briefcase,
              title: "Business OS",
              description: "CRM, leads, invoices, revenue autopilot, and AI-driven customer intelligence — all governed by your policies.",
              delay: 0.1,
              heroImage: heroBusinessAdvisor,
            },
            {
              icon: Wallet,
              title: "Finance OS",
              description: "Cashflow forecasting, tax estimation, burn rate analysis, and safe-to-spend — with every calculation receipted.",
              delay: 0.2,
              heroImage: heroMoneyAdvisor,
            },
            {
              icon: Brain,
              title: "Concierge OS",
              description: "AI advisors that learn your preferences, execute within trust boundaries, and explain every decision they make.",
              delay: 0.3,
              heroImage: heroConciergeAdvisor,
            },
          ].map(({ icon: Icon, title, description, delay, heroImage }) => (
            <FadeInSection key={title} delay={delay}>
              <div className="group relative rounded-2xl border border-border/30 bg-card/40 backdrop-blur-2xl overflow-hidden transition-all duration-500 hover:border-primary/25 hover:bg-card/60 hover:-translate-y-1 hover:shadow-card-hover">
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={heroImage}
                    alt={`${title} advisor`}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                    width={1280}
                    height={720}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-card/30 to-transparent" />
                  <div className="absolute bottom-3 left-4">
                    <div className="h-9 w-9 rounded-xl bg-background/80 backdrop-blur-sm flex items-center justify-center border border-border/30">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                </div>
                <div className="relative p-6 pt-4">
                  <h3 className="text-lg font-semibold font-display tracking-[-0.01em] mb-2 group-hover:text-primary transition-colors">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                </div>
              </div>
            </FadeInSection>
          ))}
        </div>
      </section>

      {/* Trust indicators */}
      <FadeInSection>
        <section className="relative z-10 border-t border-border/20 py-16 px-6">
          <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-10 text-sm text-muted-foreground">
            {[
              { icon: Receipt, label: "Every action receipted" },
              { icon: Shield, label: "Policy-governed execution" },
              { icon: Lock, label: "Your data stays yours" },
            ].map(({ icon: Icon, label }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...spring, delay: 0.1 * i }}
                className="flex items-center gap-2.5"
              >
                <div className="h-8 w-8 rounded-lg bg-primary/8 flex items-center justify-center">
                  <Icon className="h-4 w-4 text-primary/70" />
                </div>
                <span className="tracking-[-0.01em]">{label}</span>
              </motion.div>
            ))}
          </div>
        </section>
      </FadeInSection>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/20 py-8 px-6 text-center text-xs text-muted-foreground/60 tracking-wide">
        © {new Date().getFullYear()} SITA OS. All rights reserved.
      </footer>

      <style>{`
        .text-gradient-hero {
          background: linear-gradient(135deg, hsl(265 65% 68%) 0%, hsl(265 55% 58%) 40%, hsl(38 85% 58%) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmerText 8s ease-in-out infinite;
          background-size: 200% 200%;
        }
        @keyframes shimmerText {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes orbFloat {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -20px) scale(1.05); }
          66% { transform: translate(-20px, 15px) scale(0.95); }
        }
      `}</style>
    </div>
  );
});

LandingPage.displayName = "LandingPage";

export default LandingPage;
