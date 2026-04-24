import { Card, CardContent } from "@/components/ui/card";
import { FlaskConical } from "lucide-react";

export default function LabsSettings() {
  return (
    <Card>
      <CardContent className="p-5 space-y-2">
        <div className="flex items-center gap-2">
          <FlaskConical className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">Advanced / Labs</h2>
        </div>
        <p className="text-xs text-muted-foreground">Experimental capabilities will appear here as they ship.</p>
      </CardContent>
    </Card>
  );
}
