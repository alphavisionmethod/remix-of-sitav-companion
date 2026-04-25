import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Home, Compass, Shield } from "lucide-react";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
<motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md px-6"
      >
        {/* Animated 404 indicator */}
        <div className="relative mx-auto mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/15"
          >
            <Compass className="h-10 w-10 text-primary/60" strokeWidth={1.5} />
          </motion.div>
          <div className="absolute -right-2 -top-2 h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center border border-accent/20">
            <Shield className="h-4 w-4 text-accent" />
          </div>
        </div>

        <h1 className="font-display text-5xl font-bold text-foreground tracking-tight">404</h1>
        <p className="mt-3 text-lg font-medium text-foreground">Space not found</p>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          The workspace you're looking for doesn't exist or may have moved. 
          SITA can help you find what you need.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl gradient-sita px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow-purple/20 hover:opacity-90 transition-all"
          >
            <Home className="h-4 w-4" /> Go to Daily Pulse
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground hover:bg-secondary transition-all"
          >
            <ArrowLeft className="h-4 w-4" /> Go back
          </button>
        </div>

        <p className="mt-6 text-[11px] text-muted-foreground/50 font-mono">
          {location.pathname}
        </p>
      </motion.div>
    </div>
  );
};

export default NotFound;
