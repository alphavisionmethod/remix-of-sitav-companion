import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const DOMAIN_STYLES: Record<string, string> = {
  money:
    "Sharp-suited financial professional, emerald green color palette, confident expression, modern corporate headshot, clean background",
  business:
    "Executive business leader, deep purple color palette, authoritative presence, tailored suit, studio lighting, clean background",
  concierge:
    "Polished hospitality professional, warm gold and amber tones, welcoming smile, elegant attire, soft studio lighting, clean background",
  growth:
    "Futuristic tech strategist, blue and cyan color palette, analytical gaze, modern minimalist style, clean background",
  trust:
    "Trustworthy security advisor, teal and green tones, calm demeanor, professional attire, clean background",
  opportunity:
    "Innovative opportunity scout, gold and orange accents, energetic expression, smart casual style, clean background",
  recovery:
    "Composed crisis manager, slate gray tones, steady expression, formal attire, clean background",
  boardroom:
    "Senior board executive, deep navy and purple, distinguished appearance, premium suit, clean background",
  family:
    "Warm family advisor, rose and pink tones, caring expression, approachable style, clean background",
  general:
    "Versatile AI advisor, gradient purple to gold, intelligent expression, modern professional style, clean background",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization");
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Verify user
    const token = authHeader?.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { advisors } = await req.json();
    if (!Array.isArray(advisors) || advisors.length === 0) {
      return new Response(JSON.stringify({ error: "advisors array required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results: Array<{ advisor_id: string; avatar_url: string | null; error?: string }> = [];

    for (const advisor of advisors) {
      const { advisor_id, display_name, domain } = advisor;
      try {
        const styleHint = DOMAIN_STYLES[domain] || DOMAIN_STYLES.general;
        const prompt = `Professional portrait illustration of "${display_name}", a virtual AI advisor. Style: ${styleHint}. High quality digital art, 3D rendered character portrait, soft lighting, facing slightly left, bust shot, on a clean white background.`;

        const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3.1-flash-image-preview",
            messages: [{ role: "user", content: prompt }],
            modalities: ["image", "text"],
          }),
        });

        if (!aiRes.ok) {
          const errText = await aiRes.text();
          console.error(`AI error for ${advisor_id}:`, aiRes.status, errText);
          results.push({ advisor_id, avatar_url: null, error: `AI error ${aiRes.status}` });
          continue;
        }

        const aiData = await aiRes.json();
        const imageUrl = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

        if (!imageUrl) {
          results.push({ advisor_id, avatar_url: null, error: "No image returned" });
          continue;
        }

        // Extract base64 data and upload to storage
        const base64Match = imageUrl.match(/^data:image\/(\w+);base64,(.+)$/);
        if (!base64Match) {
          results.push({ advisor_id, avatar_url: null, error: "Invalid image format" });
          continue;
        }

        const ext = base64Match[1] === "jpeg" ? "jpg" : base64Match[1];
        const base64Data = base64Match[2];
        const binaryData = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

        const filePath = `advisor-avatars/${user.id}/${advisor_id}.${ext}`;
        const { error: uploadError } = await supabaseClient.storage
          .from("user-files")
          .upload(filePath, binaryData, {
            contentType: `image/${ext === "jpg" ? "jpeg" : ext}`,
            upsert: true,
          });

        if (uploadError) {
          console.error(`Upload error for ${advisor_id}:`, uploadError);
          results.push({ advisor_id, avatar_url: null, error: uploadError.message });
          continue;
        }

        const { data: urlData } = supabaseClient.storage
          .from("user-files")
          .getPublicUrl(filePath);

        const publicUrl = urlData.publicUrl;

        // Upsert advisor profile
        await supabaseClient.from("advisor_profiles").upsert(
          {
            user_id: user.id,
            advisor_id,
            domain,
            display_name,
            avatar_url: publicUrl,
            visual_style: domain,
          },
          { onConflict: "advisor_id,user_id" }
        );

        results.push({ advisor_id, avatar_url: publicUrl });

        // Small delay between generations to avoid rate limits
        if (advisors.indexOf(advisor) < advisors.length - 1) {
          await new Promise((r) => setTimeout(r, 1500));
        }
      } catch (err) {
        console.error(`Error generating avatar for ${advisor_id}:`, err);
        results.push({ advisor_id, avatar_url: null, error: String(err) });
      }
    }

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("advisor-avatar-generate error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
