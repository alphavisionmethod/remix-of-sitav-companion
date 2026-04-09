import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Keyboard, MousePointer, Volume2, ZoomIn, Contrast } from "lucide-react";

const AccessibilitySettings = () => {
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
            <Switch />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Text Size</p>
            <Slider defaultValue={[100]} min={75} max={200} step={25} />
            <p className="text-xs text-muted-foreground">100% — Default</p>
          </div>
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium">Reduce Transparency</p><p className="text-xs text-muted-foreground">Make backgrounds more opaque</p></div>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium">Bold Text</p><p className="text-xs text-muted-foreground">Use heavier font weight throughout</p></div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><MousePointer className="h-4 w-4" /> Motion</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium">Reduce Motion</p><p className="text-xs text-muted-foreground">Minimize animations and transitions</p></div>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium">Reduce Auto-Playing Effects</p><p className="text-xs text-muted-foreground">Stop ambient animations</p></div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Keyboard className="h-4 w-4" /> Keyboard & Navigation</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium">Full Keyboard Navigation</p><p className="text-xs text-muted-foreground">Navigate all surfaces with keyboard only</p></div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium">Focus Indicators</p><p className="text-xs text-muted-foreground">Show visible focus rings on all interactive elements</p></div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Volume2 className="h-4 w-4" /> Screen Reader</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium">Screen Reader Optimized</p><p className="text-xs text-muted-foreground">Enhance ARIA labels and semantic structure</p></div>
            <Switch />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Announcement Verbosity</p>
            <Select defaultValue="standard">
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
