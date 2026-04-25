import { Card, CardContent } from "@/components/ui/card";

export default function FilesSettings() {
  return (
    <Card>
      <CardContent className="p-5 space-y-2">
        <h2 className="text-sm font-semibold">Files & Knowledge</h2>
        <p className="text-xs text-muted-foreground">Upload files to a workspace from the workspace page. Indexed files become Brain context.</p>
      </CardContent>
    </Card>
  );
}
