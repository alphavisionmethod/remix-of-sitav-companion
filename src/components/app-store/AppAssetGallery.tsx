// ═══════════════════════════════════════════════════════════════
// AppAssetGallery — renders screenshots from app_assets table
// ═══════════════════════════════════════════════════════════════
import { useQuery } from "@tanstack/react-query";
import { ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ingestionService } from "@/lib/services/app-ingestion/ingestion.service";

interface Props {
  appId: string;
}

interface AssetRow {
  id: string;
  asset_type: string;
  storage_path: string;
  width: number | null;
  height: number | null;
  source_url: string | null;
}

export function AppAssetGallery({ appId }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ["app-assets", appId, "screenshots"],
    queryFn: async () => {
      const c = supabase as unknown as {
        from: (t: string) => {
          select: (s: string) => {
            eq: (k: string, v: string) => {
              eq: (k: string, v: string) => {
                order: (k: string, o: { ascending: boolean }) => Promise<{ data: AssetRow[] | null }>;
              };
            };
          };
        };
      };
      const { data } = await c.from("app_assets").select("id,asset_type,storage_path,width,height,source_url")
        .eq("app_id", appId).eq("asset_type", "screenshot").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  if (isLoading) return <div className="h-32 bg-muted animate-pulse rounded-lg" />;
  if (!data || data.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center">
        <ImageIcon className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No screenshots yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {data.map((asset) => (
        <a
          key={asset.id}
          href={ingestionService.publicAssetUrl(asset.storage_path)}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-lg overflow-hidden border bg-muted hover:ring-2 hover:ring-primary transition"
        >
          <img
            src={ingestionService.publicAssetUrl(asset.storage_path)}
            alt="App screenshot"
            className="w-full h-auto"
            loading="lazy"
          />
        </a>
      ))}
    </div>
  );
}
