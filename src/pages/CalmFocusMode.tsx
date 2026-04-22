import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDisplayMode } from "@/contexts/AppearanceContext";
import { Moon, Sun, Eye, Volume2, VolumeX, Minimize2, Maximize2 } from "lucide-react";

const CalmFocusMode = () => {
  const { mode, setMode, isFocus, isCalm, toggleFocus, toggleCalm } = useDisplayMode();

  return (
    <PageShell width="narrow">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Display Modes</h1>
        <p className="text-muted-foreground mt-1">
          Control how SITA presents information. Choose a mode that matches your current state.
        </p>
      </div>

      <div className="grid gap-4">
        <Card
          className={`cursor-pointer transition-all border-2 ${mode === "standard" ? "border-primary bg-primary/5" : "border-transparent hover:border-muted"}`}
          onClick={() => setMode("standard")}
        >
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <div className="p-2 rounded-lg bg-primary/10"><Sun className="h-5 w-5 text-primary" /></div>
            <div className="flex-1">
              <CardTitle className="text-lg">Standard</CardTitle>
              <CardDescription>Full interface with all surfaces, advisors, and information density</CardDescription>
            </div>
            {mode === "standard" && <Badge variant="default">Active</Badge>}
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Everything visible. Ideal for active work sessions, planning, and review.
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all border-2 ${isFocus ? "border-primary bg-primary/5" : "border-transparent hover:border-muted"}`}
          onClick={toggleFocus}
        >
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <div className="p-2 rounded-lg bg-amber-500/10"><Eye className="h-5 w-5 text-amber-500" /></div>
            <div className="flex-1">
              <CardTitle className="text-lg">Focus</CardTitle>
              <CardDescription>Minimal distractions. Only essential information surfaces</CardDescription>
            </div>
            {isFocus && <Badge variant="default">Active</Badge>}
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Sidebar collapses. Notifications paused. Advisors go quiet. Use <kbd className="px-1 py-0.5 rounded bg-muted text-xs">⌘.</kbd> to toggle.
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all border-2 ${isCalm ? "border-primary bg-primary/5" : "border-transparent hover:border-muted"}`}
          onClick={toggleCalm}
        >
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <div className="p-2 rounded-lg bg-blue-500/10"><Moon className="h-5 w-5 text-blue-500" /></div>
            <div className="flex-1">
              <CardTitle className="text-lg">Calm</CardTitle>
              <CardDescription>Reduced visual energy. Softer colors, wider spacing, slower animations</CardDescription>
            </div>
            {isCalm && <Badge variant="default">Active</Badge>}
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            For end-of-day review or when you need a gentler interface. Use <kbd className="px-1 py-0.5 rounded bg-muted text-xs">⌘,</kbd> to toggle.
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sensory Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Minimize2 className="h-4 w-4 text-muted-foreground" />
              <div><p className="text-sm font-medium">Reduced Motion</p><p className="text-xs text-muted-foreground">Minimize animations system-wide</p></div>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <VolumeX className="h-4 w-4 text-muted-foreground" />
              <div><p className="text-sm font-medium">Silent Mode</p><p className="text-xs text-muted-foreground">No audio confirmations or alerts</p></div>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Maximize2 className="h-4 w-4 text-muted-foreground" />
              <div><p className="text-sm font-medium">High Contrast</p><p className="text-xs text-muted-foreground">Increase text and border contrast</p></div>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalmFocusMode;
