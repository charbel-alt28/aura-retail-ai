import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGINS = [
  "https://id-preview--0e11076a-52d0-4e37-8636-cd7dbad7fa70.lovable.app",
  "http://localhost:5173",
  "http://localhost:8080",
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("Origin") || "";
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  };
}

/**
 * Expiry Check Edge Function
 * 
 * Scans products for expiry, auto-logs wastage, generates alerts.
 * Manual calls require authenticated admin/operator/inventory_manager.
 * Cron calls (no auth header) use service role.
 */
Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization");
    let isCronCall = false;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      isCronCall = true;
    } else {
      // Manual call — validate user with getUser()
      const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: { user }, error: userError } = await userClient.auth.getUser();
      if (userError || !user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { data: roleData } = await userClient.rpc("get_user_role", { _user_id: user.id });
      if (!roleData || !["admin", "operator", "inventory_manager"].includes(roleData)) {
        return new Response(JSON.stringify({ error: "Insufficient permissions" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Use service role client for DB operations
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Parse request body
    let products: any[] = [];
    try {
      const body = await req.json();
      if (!Array.isArray(body?.products)) {
        return new Response(JSON.stringify({ error: "Invalid request: 'products' must be an array" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      products = body.products;
    } catch {
      return new Response(JSON.stringify({ 
        message: "Expiry check function ready. Send { products: [...] } for scanning.",
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

    if (products.length > 500) {
      return new Response(JSON.stringify({ error: "Too many products. Maximum 500 per request." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
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
      if (!p.expiryDate || typeof p.expiryDate !== "string") continue;

      // Validate date format
      const dateMatch = p.expiryDate.match(/^\d{4}-\d{2}-\d{2}$/);
      if (!dateMatch) continue;

      const expiryDate = new Date(p.expiryDate + "T00:00:00");
      if (isNaN(expiryDate.getTime())) continue;

      const diffMs = expiryDate.getTime() - now.getTime();
      const daysUntilExpiry = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      const stock = Number(p.stock) || 0;
      const price = Number(p.currentPrice) || 0;

      if (daysUntilExpiry <= 0 && stock > 0) {
        expired.push({
          ...p,
          daysUntilExpiry,
          totalValueLost: stock * price,
          recommendedAction: "Discard immediately — log as wastage",
        });

        if (!alreadyLogged.has(p.id)) {
          wastageLogs.push({
            product_id: String(p.id).slice(0, 100),
            product_name: String(p.name || "Unknown").slice(0, 200),
            sku: String(p.sku || `SKU-${String(p.id).padStart(3, "0")}`).slice(0, 50),
            category: p.category ? String(p.category).slice(0, 50) : null,
            quantity_discarded: stock,
            unit_value: price,
            total_value_lost: stock * price,
            expiry_date: p.expiryDate,
            reason: "expired",
            notes: `Auto-flagged by scheduled scan at ${new Date().toISOString()}. Location: ${String(p.storageLocation || "Unknown").slice(0, 100)}`,
          });
        }
      } else if (daysUntilExpiry > 0 && daysUntilExpiry <= 3) {
        expiringSoon.push({
          ...p,
          daysUntilExpiry,
          totalValueAtRisk: stock * price,
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
    const corsHeaders = getCorsHeaders(req);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
