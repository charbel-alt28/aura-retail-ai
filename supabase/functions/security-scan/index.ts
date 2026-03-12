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

    // Verify caller is admin — REQUIRED
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getUser(token);
    if (claimsError || !claimsData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.user.id;

    // Check admin role
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleData) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const events: Array<{
      event_type: string;
      severity: string;
      description: string;
      metadata: Record<string, unknown>;
    }> = [];

    // 1. Check for brute force: same email with 5+ failures in last 15 min
    const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const { data: recentFails } = await supabase
      .from("failed_login_attempts")
      .select("email, attempted_at")
      .gte("attempted_at", fifteenMinAgo);

    if (recentFails) {
      const emailCounts: Record<string, number> = {};
      recentFails.forEach((f: { email: string }) => {
        emailCounts[f.email] = (emailCounts[f.email] || 0) + 1;
      });

      for (const [email, count] of Object.entries(emailCounts)) {
        if (count >= 5) {
          events.push({
            event_type: "BRUTE_FORCE_DETECTED",
            severity: "critical",
            description: `${count} failed login attempts for ${email} in last 15 minutes`,
            metadata: { email, count, window: "15min" },
          });
        } else if (count >= 3) {
          events.push({
            event_type: "SUSPICIOUS_LOGIN_ACTIVITY",
            severity: "high",
            description: `${count} failed login attempts for ${email} in last 15 minutes`,
            metadata: { email, count, window: "15min" },
          });
        }
      }
    }

    // 2. Check for multiple distinct emails failing from similar patterns (credential stuffing)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: hourFails } = await supabase
      .from("failed_login_attempts")
      .select("email")
      .gte("attempted_at", oneHourAgo);

    if (hourFails) {
      const uniqueEmails = new Set(hourFails.map((f: { email: string }) => f.email));
      if (uniqueEmails.size >= 10) {
        events.push({
          event_type: "CREDENTIAL_STUFFING_SUSPECTED",
          severity: "critical",
          description: `${uniqueEmails.size} unique emails failed login in the last hour — possible credential stuffing attack`,
          metadata: { uniqueEmailCount: uniqueEmails.size, totalAttempts: hourFails.length },
        });
      }
    }

    // 3. Check for unusual sign-in patterns (rapid successive logins)
    const { data: recentLogins } = await supabase
      .from("auth_audit_logs")
      .select("user_id, created_at, event_type")
      .eq("event_type", "sign_in")
      .gte("created_at", fifteenMinAgo);

    if (recentLogins) {
      const userLogins: Record<string, number> = {};
      recentLogins.forEach((l: { user_id: string | null }) => {
        if (l.user_id) userLogins[l.user_id] = (userLogins[l.user_id] || 0) + 1;
      });

      for (const [userId, count] of Object.entries(userLogins)) {
        if (count >= 5) {
          events.push({
            event_type: "RAPID_AUTH_ACTIVITY",
            severity: "medium",
            description: `User ${userId.slice(0, 8)}... had ${count} sign-ins in 15 minutes`,
            metadata: { userId, loginCount: count },
          });
        }
      }
    }

    // Insert any discovered events
    if (events.length > 0) {
      await supabase.from("security_events").insert(events);
    }

    return new Response(
      JSON.stringify({
        scanned: true,
        eventsFound: events.length,
        events: events.map((e) => ({
          type: e.event_type,
          severity: e.severity,
          description: e.description,
        })),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
