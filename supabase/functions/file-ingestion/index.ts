import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { handleCors, corsHeaders, corsResponse, corsError } from "../_shared/cors.ts";
import { checkRateLimit, rateLimitResponse } from "../_shared/rate-limit.ts";
import { EdgeLogger } from "../_shared/logger.ts";

const logger = new EdgeLogger("file-ingestion");

serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { storage_path, filename, mime_type, size_bytes } = await req.json();
    if (!storage_path || !filename) {
      return new Response(JSON.stringify({ error: "storage_path and filename required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use AI to classify the file
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    let classification = "general";
    let extractedData: Record<string, unknown> = {};
    let sensitivity = "internal";

    if (LOVABLE_API_KEY) {
      try {
        const classifyResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-lite",
            messages: [
              {
                role: "system",
                content: "You classify files. Return JSON only with: classification (invoice, receipt, contract, nda, tax-document, bank-statement, medical, school, travel, identification, insurance, general), sensitivity (public, internal, confidential, restricted), and extracted_fields (key facts as key-value pairs).",
              },
              {
                role: "user",
                content: `Classify this file:\nFilename: ${filename}\nMIME: ${mime_type || "unknown"}\nSize: ${size_bytes || 0} bytes`,
              },
            ],
            tools: [{
              type: "function",
              function: {
                name: "classify_file",
                description: "Classify a file and extract metadata",
                parameters: {
                  type: "object",
                  properties: {
                    classification: { type: "string", enum: ["invoice", "receipt", "contract", "nda", "tax-document", "bank-statement", "medical", "school", "travel", "identification", "insurance", "general"] },
                    sensitivity: { type: "string", enum: ["public", "internal", "confidential", "restricted"] },
                    extracted_fields: { type: "object", additionalProperties: { type: "string" } },
                  },
                  required: ["classification", "sensitivity"],
                },
              },
            }],
            tool_choice: { type: "function", function: { name: "classify_file" } },
          }),
        });

        if (classifyResponse.ok) {
          const data = await classifyResponse.json();
          const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
          if (toolCall?.function?.arguments) {
            const parsed = JSON.parse(toolCall.function.arguments);
            classification = parsed.classification || "general";
            sensitivity = parsed.sensitivity || "internal";
            extractedData = parsed.extracted_fields || {};
          }
        }
      } catch (aiErr) {
        console.error("AI classification failed, using defaults:", aiErr);
      }
    }

    // Store metadata
    const { data: metadata, error: insertError } = await supabase.from("file_metadata").insert({
      user_id: user.id,
      storage_path,
      filename,
      mime_type: mime_type || null,
      size_bytes: size_bytes || null,
      classification,
      extracted_data: extractedData,
      sensitivity,
      status: "classified",
    }).select().single();

    if (insertError) throw insertError;

    // Create notification
    await supabase.from("notifications").insert({
      user_id: user.id,
      type: "system",
      domain: "files",
      title: `File classified: ${filename}`,
      body: `Classified as ${classification} (${sensitivity})`,
      urgency: sensitivity === "restricted" ? "high" : "low",
    });

    return new Response(JSON.stringify({ metadata, classification, sensitivity, extractedData }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("file-ingestion error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
