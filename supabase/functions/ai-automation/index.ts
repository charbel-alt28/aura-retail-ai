import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGINS = [
  "https://id-preview--0e11076a-52d0-4e37-8636-cd7dbad7fa70.lovable.app",
  "https://0e11076a-52d0-4e37-8636-cd7dbad7fa70.lovableproject.com",
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

// Simple in-memory rate limiter (per-user, resets on cold start)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10; // max requests
const RATE_WINDOW_MS = 60_000; // per minute

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

const VALID_ACTIONS = ["optimize", "forecast", "anomaly", "recommendations"] as const;
type AIAction = (typeof VALID_ACTIONS)[number];

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // === Authentication ===
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

    const userId = user.id;

    // === Rate limiting ===
    if (!checkRateLimit(userId)) {
      return new Response(JSON.stringify({ error: "Too many AI requests. Please wait a moment before trying again." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // === Authorization: admin or operator only ===
    const { data: roleData } = await supabaseClient.rpc("get_user_role", { _user_id: userId });
    if (!roleData || !["admin", "operator"].includes(roleData)) {
      return new Response(JSON.stringify({ error: "Insufficient permissions. Admin or operator role required." }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // === Validate request body ===
    let body: any;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid request body" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, products } = body;

    if (!action || !VALID_ACTIONS.includes(action)) {
      return new Response(JSON.stringify({ error: `Invalid action. Must be one of: ${VALID_ACTIONS.join(", ")}` }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!Array.isArray(products) || products.length === 0) {
      return new Response(JSON.stringify({ error: "Products array is required and must not be empty" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (products.length > 500) {
      return new Response(JSON.stringify({ error: "Too many products. Maximum 500 per request." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("AI service is not configured. Please contact support.");

    const systemPrompts: Record<AIAction, string> = {
      optimize: `You are an AI hypermarket optimization engine. You will receive product inventory data AND active pricing rules. You MUST apply the pricing rules to generate price adjustment suggestions. For each rule, check if the product matches the rule's conditions (demand_level, category, stock thresholds) and apply the specified adjustment. Given the product inventory data, analyze and provide:
1. Which products need price adjustments based on the ACTIVE PRICING RULES and why
2. Which products need restocking urgently
3. Overall optimization score (0-100)
4. 3-5 specific actionable recommendations referencing the rules applied

Respond in JSON format:
{
  "score": number,
  "priceAdjustments": [{"productId": string, "name": string, "currentPrice": number, "suggestedPrice": number, "reason": string, "ruleApplied": string}],
  "restockAlerts": [{"productId": string, "name": string, "currentStock": number, "suggestedOrder": number, "urgency": "critical"|"warning"|"low"}],
  "recommendations": [string],
  "rulesApplied": [{"ruleName": string, "productsAffected": number, "totalImpact": string}],
  "summary": string
}`,

      forecast: `You are a demand forecasting AI for a hypermarket. Given the product data with current stock levels, demand levels, pricing, AND active pricing rules, predict next week's demand. Factor in how active pricing rules (discounts, promotions, surge pricing) will influence demand patterns.

Respond in JSON format:
{
  "weeklyForecast": [{"productId": string, "name": string, "predictedDemand": number, "confidence": number, "trend": "up"|"stable"|"down", "pricingRuleImpact": string}],
  "topMovers": [{"name": string, "change": string}],
  "summary": string,
  "confidenceScore": number
}`,

      anomaly: `You are an anomaly detection AI for a hypermarket. You will receive product data AND active pricing rules. Analyze for unusual patterns:
- Prices that violate active pricing rules (e.g., a high-demand item NOT marked up per the rule)
- Stock levels that seem abnormal given the rules in place
- Demand mismatches (high demand + low stock or vice versa)
- Rules that conflict with each other
- Any suspicious patterns

Respond in JSON format:
{
  "anomalies": [{"productId": string, "name": string, "type": "price"|"stock"|"demand"|"pattern"|"rule_violation", "severity": "high"|"medium"|"low", "description": string, "relatedRule": string}],
  "riskScore": number,
  "summary": string
}`,

      recommendations: `You are a smart recommendations AI for a hypermarket. Based on the product data AND active pricing rules, suggest:
1. Bundle promotions (products that go well together, considering active discounts)
2. Markdown candidates (slow movers that aren't already covered by rules)
3. Premium upsell opportunities (leveraging surge pricing rules)
4. Rule optimization suggestions (which rules to adjust, add, or deactivate)
5. Seasonal strategies

Respond in JSON format:
{
  "bundles": [{"products": [string], "discount": string, "reason": string}],
  "markdowns": [{"name": string, "suggestedDiscount": string, "reason": string, "existingRule": string}],
  "upsells": [{"name": string, "strategy": string}],
  "ruleOptimizations": [{"ruleName": string, "suggestion": string, "expectedImpact": string}],
  "seasonal": [string],
  "summary": string
}`
    };

    const systemPrompt = systemPrompts[action as AIAction];

    // Fetch active pricing rules from the database
    const serviceClient2 = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: pricingRules } = await serviceClient2
      .from("pricing_rules")
      .select("*")
      .eq("is_active", true)
      .order("priority", { ascending: false });

    const rulesContext = pricingRules && pricingRules.length > 0
      ? `\n\nACTIVE PRICING RULES (apply these when making recommendations):\n${JSON.stringify(
          pricingRules.map((r: any) => ({
            name: r.name,
            type: r.rule_type,
            adjustmentType: r.adjustment_type,
            adjustmentValue: r.adjustment_value,
            conditions: r.conditions,
            priority: r.priority,
          })),
          null,
          2
        )}`
      : "";

    // Sanitize product data — only send safe fields
    const productSummary = products.map((p: any) => ({
      id: typeof p.id === "string" ? p.id.slice(0, 50) : String(p.id).slice(0, 50),
      name: typeof p.name === "string" ? p.name.slice(0, 100) : "Unknown",
      stock: Number(p.stock) || 0,
      reorderLevel: Number(p.reorderLevel) || 0,
      basePrice: Number(p.basePrice) || 0,
      currentPrice: Number(p.currentPrice) || 0,
      demandLevel: ["low", "medium", "high"].includes(p.demandLevel) ? p.demandLevel : "medium",
      demandForecast: Number(p.demandForecast) || 0,
      category: typeof p.category === "string" ? p.category.slice(0, 50) : "uncategorized",
    }));

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
          { role: "user", content: `Here is the current product inventory data:\n${JSON.stringify(productSummary, null, 2)}${rulesContext}` },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "AI rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits in Settings → Workspace → Usage." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service temporarily unavailable. Please try again later." }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return new Response(JSON.stringify({ error: "AI returned an empty response. Please try again." }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = { summary: content, raw: true };
    }

    // Log successful AI action to agent_logs
    const serviceClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    await serviceClient.from("agent_logs").insert({
      agent_type: "ai_automation",
      action: `AI_${action.toUpperCase()}`,
      status: "success",
      details: {
        userId,
        action,
        productsAnalyzed: productSummary.length,
        timestamp: new Date().toISOString(),
      },
    }).then(({ error }) => { if (error) console.error("Failed to log AI action:", error); });

    return new Response(JSON.stringify({ action, result: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-automation error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "An unexpected error occurred" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
