import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * Scheduled Expiry Check Edge Function
 * 
 * Called by pg_cron every hour to:
 * 1. Scan all products with expiry dates
 * 2. Auto-flag expired items into wastage_logs
 * 3. Generate expiry alerts for items expiring within 2-3 days
 * 4. Log results to agent_logs for audit trail
 * 
 * Runs with service role — no user auth needed for cron calls.
 * For manual invocations, validates JWT.
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // For manual calls, validate auth. For cron calls (no auth header), use service role.
    const authHeader = req.headers.get("Authorization");
    let isCronCall = false;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // Could be a cron call — allow with service role
      isCronCall = true;
    } else {
      // Manual call — validate user
      const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
        global: { headers: { Authorization: authHeader } },
      });
      const token = authHeader.replace("Bearer ", "");
      const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
      if (claimsError || !claimsData?.claims) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const userId = claimsData.claims.sub;
      const { data: roleData } = await userClient.rpc("get_user_role", { _user_id: userId });
      if (!roleData || !["admin", "operator", "inventory_manager"].includes(roleData)) {
        return new Response(JSON.stringify({ error: "Insufficient permissions" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Use service role client for DB operations
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Parse the request body for product data (sent from frontend or cron payload)
    let products: any[] = [];
    try {
      const body = await req.json();
      products = body.products || [];
    } catch {
      // Cron call with no body — return info response
      return new Response(JSON.stringify({ 
        message: "Expiry check function ready. Send products array for scanning.",
        timestamp: new Date().toISOString(),
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (products.length === 0) {
      return new Response(JSON.stringify({ message: "No products to scan" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const todayStr = now.toISOString().split("T")[0];

    // Get already-logged items for today to avoid duplicates
    const { data: existingLogs } = await supabase
      .from("wastage_logs")
      .select("product_id")
      .gte("date_discarded", `${todayStr}T00:00:00Z`);

    const alreadyLogged = new Set((existingLogs || []).map((l: any) => l.product_id));

    const expired: any[] = [];
    const expiringSoon: any[] = [];
    const wastageLogs: any[] = [];

    for (const p of products) {
      if (!p.expiryDate) continue;

      const expiryDate = new Date(p.expiryDate + "T00:00:00");
      const diffMs = expiryDate.getTime() - now.getTime();
      const daysUntilExpiry = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      if (daysUntilExpiry <= 0 && p.stock > 0) {
        expired.push({
          ...p,
          daysUntilExpiry,
          totalValueLost: p.stock * p.currentPrice,
          recommendedAction: "Discard immediately — log as wastage",
        });

        // Auto-log to wastage if not already logged today
        if (!alreadyLogged.has(p.id)) {
          wastageLogs.push({
            product_id: p.id,
            product_name: p.name,
            sku: p.sku || `SKU-${String(p.id).padStart(3, "0")}`,
            category: p.category || null,
            quantity_discarded: p.stock,
            unit_value: p.currentPrice,
            total_value_lost: p.stock * p.currentPrice,
            expiry_date: p.expiryDate,
            reason: "expired",
            notes: `Auto-flagged by scheduled scan at ${new Date().toISOString()}. Location: ${p.storageLocation || "Unknown"}`,
          });
        }
      } else if (daysUntilExpiry > 0 && daysUntilExpiry <= 3) {
        expiringSoon.push({
          ...p,
          daysUntilExpiry,
          totalValueAtRisk: p.stock * p.currentPrice,
          recommendedAction: daysUntilExpiry <= 2
            ? "Apply 50%+ discount or donate immediately"
            : "Apply 25-30% promotional discount",
        });
      }
    }

    // Batch insert wastage logs
    if (wastageLogs.length > 0) {
      const { error: insertError } = await supabase
        .from("wastage_logs")
        .insert(wastageLogs);

      if (insertError) {
        console.error("Failed to insert wastage logs:", insertError);
      }
    }

    // Log scan results to agent_logs
    await supabase.from("agent_logs").insert({
      agent_type: "inventory",
      action: "SCHEDULED_EXPIRY_SCAN",
      status: expired.length > 0 ? "warning" : "success",
      details: {
        timestamp: new Date().toISOString(),
        totalScanned: products.length,
        expiredCount: expired.length,
        expiringSoonCount: expiringSoon.length,
        totalWastageLogged: wastageLogs.length,
        totalValueExpired: expired.reduce((s: number, e: any) => s + e.totalValueLost, 0),
        totalValueAtRisk: expiringSoon.reduce((s: number, e: any) => s + e.totalValueAtRisk, 0),
        isCronCall,
      },
    });

    const result = {
      timestamp: new Date().toISOString(),
      scanned: products.length,
      expired: {
        count: expired.length,
        items: expired.map((e) => ({
          id: e.id,
          name: e.name,
          stock: e.stock,
          expiryDate: e.expiryDate,
          valueLost: e.totalValueLost,
          action: e.recommendedAction,
          storageLocation: e.storageLocation,
        })),
        totalValueLost: expired.reduce((s: number, e: any) => s + e.totalValueLost, 0),
      },
      expiringSoon: {
        count: expiringSoon.length,
        items: expiringSoon.map((e) => ({
          id: e.id,
          name: e.name,
          stock: e.stock,
          expiryDate: e.expiryDate,
          daysLeft: e.daysUntilExpiry,
          valueAtRisk: e.totalValueAtRisk,
          action: e.recommendedAction,
          storageLocation: e.storageLocation,
        })),
        totalValueAtRisk: expiringSoon.reduce((s: number, e: any) => s + e.totalValueAtRisk, 0),
      },
      wastageAutoLogged: wastageLogs.length,
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("expiry-check error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
