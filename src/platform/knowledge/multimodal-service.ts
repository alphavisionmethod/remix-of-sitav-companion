// ═══════════════════════════════════════════════════════════════
// SITA OS — Phase 8 Multi-Modal Ingest Service
// Uploads image/audio/video media to the user-files bucket and
// inserts knowledge_chunks rows tagged with modality + media_uri
// so the embedder can route them through the right gateway model.
// ═══════════════════════════════════════════════════════════════
import { supabase } from "@/integrations/supabase/client";

export type Modality = "text" | "image" | "audio" | "video";

const MIME_TO_MODALITY: Array<[RegExp, Modality]> = [
  [/^image\//, "image"],
  [/^audio\//, "audio"],
  [/^video\//, "video"],
];

export function modalityFromMime(mime: string): Modality {
  for (const [re, m] of MIME_TO_MODALITY) if (re.test(mime)) return m;
  return "text";
}

export interface IngestMediaInput {
  file: File;
  workspaceId: string;
  caption?: string;
  /** Optional pillar tag — defaults to "shared". */
  pillar?: string;
}

export interface IngestMediaResult {
  chunkId: string;
  mediaUri: string;
  modality: Modality;
}

/**
 * Upload media and queue a multi-modal chunk for embedding.
 * Returns the new chunk id + storage path.
 */
export async function ingestMedia(input: IngestMediaInput): Promise<IngestMediaResult> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("auth_required");

  const modality = modalityFromMime(input.file.type || "application/octet-stream");
  const ext = input.file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const path = `${user.id}/${input.workspaceId}/multimodal/${crypto.randomUUID()}.${ext}`;

  const upload = await supabase.storage
    .from("user-files")
    .upload(path, input.file, { contentType: input.file.type, upsert: false });
  if (upload.error) throw upload.error;

  const sb = supabase as unknown as {
    from: (t: string) => {
      insert: (p: unknown) => {
        select: (q: string) => { single: () => Promise<{ data: { id: string } | null; error: unknown }> };
      };
    };
  };

  const content = (input.caption ?? "").trim() || `[${modality}] ${input.file.name}`;
  const { data, error } = await sb
    .from("knowledge_chunks")
    .insert({
      user_id: user.id,
      workspace_id: input.workspaceId,
      content,
      modality,
      media_uri: path,
      media_mime: input.file.type || null,
      embedding_status: "pending",
      metadata: {
        phase: 8,
        source: "multimodal_ingest",
        original_filename: input.file.name,
        size_bytes: input.file.size,
        pillar: input.pillar ?? "shared",
      },
    })
    .select("id")
    .single();

  if (error) throw error;
  if (!data) throw new Error("chunk_insert_failed");

  return { chunkId: data.id, mediaUri: path, modality };
}

/** Public signed-URL helper for previewing uploaded media (60s). */
export async function getMediaPreviewUrl(path: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from("user-files")
    .createSignedUrl(path, 60);
  if (error || !data) return null;
  return data.signedUrl;
}