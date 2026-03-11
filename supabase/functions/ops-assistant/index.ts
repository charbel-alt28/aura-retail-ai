import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid authentication" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages } = await req.json();
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Messages array required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("AI service not configured");

    // Gather context from database
    const serviceClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    
    const [wastageRes, pricingRes, agentLogsRes, suppliersRes, purchaseOrdersRes] = await Promise.all([
      serviceClient.from("wastage_logs").select("product_name, quantity_discarded, total_value_lost, reason, category, date_discarded").order("date_discarded", { ascending: false }).limit(50),
      serviceClient.from("pricing_rules").select("name, rule_type, adjustment_type, adjustment_value, is_active, conditions").limit(50),
      serviceClient.from("agent_logs").select("agent_type, action, status, created_at, details").order("created_at", { ascending: false }).limit(20),
      serviceClient.from("suppliers").select("name, contact_name, email, is_active").limit(50),
      serviceClient.from("purchase_orders").select("id, status, total_amount, created_at, notes").order("created_at", { ascending: false }).limit(20),
    ]);

    const systemPrompt = `You are an AI Operations Assistant for a hypermarket management system. You have access to real-time operational data. Answer questions concisely and helpfully. Use markdown formatting.

IMPORTANT: The product catalog is managed locally (300 items across departments like Produce, Dairy, Meat, etc.). You don't have direct access to individual product stock levels from the database — the user should check the Inventory dashboard for that. But you CAN help with:

LIVE DATA YOU HAVE ACCESS TO:
- Recent wastage logs: ${JSON.stringify(wastageRes.data?.slice(0, 20) || [])}
- Active pricing rules: ${JSON.stringify(pricingRes.data || [])}
- Recent agent activity: ${JSON.stringify(agentLogsRes.data?.slice(0, 10) || [])}
- Suppliers: ${JSON.stringify(suppliersRes.data || [])}
- Recent purchase orders: ${JSON.stringify(purchaseOrdersRes.data?.slice(0, 10) || [])}

You can answer questions about:
1. Wastage trends, top wasted products, loss amounts
2. Active pricing rules and their configurations
3. Agent activity and system status
4. Supplier information and purchase order status
5. General store operations advice

Keep answers brief and data-driven. If you don't have the data to answer, say so clearly.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.slice(-10), // Last 10 messages for context
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please wait." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service unavailable" }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ops-assistant error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
