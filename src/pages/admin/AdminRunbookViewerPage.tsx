import { useParams } from "react-router-dom";
import { RunbookViewer } from "@/platform/admin/components/admin/runbooks/RunbookViewer";

export default function AdminRunbookViewerPage() {
  const { id } = useParams<{ id: string }>();
  if (!id) return null;
  return (
    <div className="p-4 md:p-6 max-w-[1100px] mx-auto">
      <RunbookViewer runbookId={id} />
    </div>
  );
}
