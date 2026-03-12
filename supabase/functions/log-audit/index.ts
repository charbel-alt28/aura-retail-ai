import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const { event_type, details, user_id } = await req.json();

    if (!event_type) {
      return new Response(JSON.stringify({ error: "event_type required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Capture real IP from request headers
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const userAgent = req.headers.get("user-agent") || "unknown";

    await supabase.from("auth_audit_logs").insert([
      {
        user_id: user_id || null,
        event_type,
        details: details || {},
        ip_address: ip,
        user_agent: userAgent,
      },
    ]);

    // If it's a failed login, also log to failed_login_attempts with IP
    if (event_type === "failed_login" && details?.email) {
      await supabase.from("failed_login_attempts").insert([
        {
          email: details.email,
          ip_address: ip,
          user_agent: userAgent,
        },
      ]);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
