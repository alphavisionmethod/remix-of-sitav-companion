import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Keyboard, MousePointer, Volume2 } from "lucide-react";
import { useSettingsValue } from "@/platform/settings/hooks/use-settings-value";

const AccessibilitySettings = () => {
  const [highContrast, setHighContrast] = useSettingsValue("accessibility.highContrast", false);
  const [textSize, setTextSize] = useSettingsValue("accessibility.textSize", 100);
  const [reduceTransparency, setReduceTransparency] = useSettingsValue("appearance.reduceTransparency", false);
  const [boldText, setBoldText] = useSettingsValue("accessibility.boldText", false);
  const [reduceMotion, setReduceMotion] = useSettingsValue("appearance.reduceMotion", false);
  const [reduceAutoPlay, setReduceAutoPlay] = useSettingsValue("accessibility.reduceAutoPlayEffects", false);
  const [fullKeyboardNav, setFullKeyboardNav] = useSettingsValue("accessibility.fullKeyboardNav", true);
  const [focusIndicators, setFocusIndicators] = useSettingsValue("accessibility.focusIndicators", true);
  const [screenReader, setScreenReader] = useSettingsValue("accessibility.screenReaderOptimized", false);
  const [verbosity, setVerbosity] = useSettingsValue("accessibility.announcementVerbosity", "standard");

  return (
    <div className="space-y-6 p-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Accessibility</h1>
        <p className="text-muted-foreground mt-1">Make SITA comfortable for your needs</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Eye className="h-4 w-4" /> Vision</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium">High Contrast Mode</p><p className="text-xs text-muted-foreground">Increase contrast for all UI elements</p></div>
            <Switch checked={highContrast} onCheckedChange={setHighContrast} />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Text Size</p>
            <Slider value={[textSize]} min={75} max={200} step={25} onValueChange={([v]) => setTextSize(v as Parameters<typeof setTextSize>[0])} />
            <p className="text-xs text-muted-foreground">{textSize}%{textSize === 100 ? " — Default" : ""}</p>
          </div>
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium">Reduce Transparency</p><p className="text-xs text-muted-foreground">Make backgrounds more opaque</p></div>
            <Switch checked={reduceTransparency} onCheckedChange={setReduceTransparency} />
          </div>
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium">Bold Text</p><p className="text-xs text-muted-foreground">Use heavier font weight throughout</p></div>
            <Switch checked={boldText} onCheckedChange={setBoldText} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><MousePointer className="h-4 w-4" /> Motion</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium">Reduce Motion</p><p className="text-xs text-muted-foreground">Minimize animations and transitions</p></div>
            <Switch checked={reduceMotion} onCheckedChange={setReduceMotion} />
          </div>
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium">Reduce Auto-Playing Effects</p><p className="text-xs text-muted-foreground">Stop ambient animations</p></div>
            <Switch checked={reduceAutoPlay} onCheckedChange={setReduceAutoPlay} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Keyboard className="h-4 w-4" /> Keyboard & Navigation</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium">Full Keyboard Navigation</p><p className="text-xs text-muted-foreground">Navigate all surfaces with keyboard only</p></div>
            <Switch checked={fullKeyboardNav} onCheckedChange={setFullKeyboardNav} />
          </div>
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium">Focus Indicators</p><p className="text-xs text-muted-foreground">Show visible focus rings on all interactive elements</p></div>
            <Switch checked={focusIndicators} onCheckedChange={setFocusIndicators} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Volume2 className="h-4 w-4" /> Screen Reader</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium">Screen Reader Optimized</p><p className="text-xs text-muted-foreground">Enhance ARIA labels and semantic structure</p></div>
            <Switch checked={screenReader} onCheckedChange={setScreenReader} />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Announcement Verbosity</p>
            <Select value={verbosity} onValueChange={(v) => setVerbosity(v as Parameters<typeof setVerbosity>[0])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="minimal">Minimal</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="verbose">Verbose</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccessibilitySettings;
