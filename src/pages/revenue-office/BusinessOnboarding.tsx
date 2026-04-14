import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FormationShell from "./onboarding/FormationShell";
import { useBusinessOnboarding } from "@/hooks/useBusinessOnboarding";
import { Settings, ArrowRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function BusinessOnboarding() {
  const { isLoading, isCompleted, clearCompletion } = useBusinessOnboarding();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground text-sm">Loading…</div>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full mx-auto p-6">
          <Card className="bg-card/60 border-border/40">
            <CardContent className="p-8 text-center space-y-4">
              <div className="p-3 rounded-2xl bg-primary/10 w-fit mx-auto">
                <Settings className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Setup Complete</h2>
              <p className="text-sm text-muted-foreground">
                Your business is already configured. You can modify your settings anytime or re-run the full onboarding.
              </p>
              <div className="space-y-2 pt-2">
                <Button className="w-full gap-2" onClick={() => navigate("/desktop")}>
                  <ArrowRight className="h-4 w-4" /> Go to Business OS
                </Button>
                <Button variant="outline" className="w-full gap-2" onClick={async () => {
                  await clearCompletion();
                  window.location.reload();
                }}>
                  <RotateCcw className="h-4 w-4" /> Re-run Onboarding
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <h1 className="sr-only">Business Onboarding</h1>
      <FormationShell />
    </>
  );
}
