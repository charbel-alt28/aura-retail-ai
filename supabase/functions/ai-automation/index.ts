import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { action, products } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompts: Record<string, string> = {
      optimize: `You are an AI hypermarket optimization engine. Given the product inventory data, analyze and provide:
1. Which products need price adjustments and why (demand-based)
2. Which products need restocking urgently
3. Overall optimization score (0-100)
4. 3-5 specific actionable recommendations

Respond in JSON format:
{
  "score": number,
  "priceAdjustments": [{"productId": string, "name": string, "currentPrice": number, "suggestedPrice": number, "reason": string}],
  "restockAlerts": [{"productId": string, "name": string, "currentStock": number, "suggestedOrder": number, "urgency": "critical"|"warning"|"low"}],
  "recommendations": [string],
  "summary": string
}`,

      forecast: `You are a demand forecasting AI for a hypermarket. Given the product data with current stock levels, demand levels, and pricing, predict next week's demand. 

Respond in JSON format:
{
  "weeklyForecast": [{"productId": string, "name": string, "predictedDemand": number, "confidence": number, "trend": "up"|"stable"|"down"}],
  "topMovers": [{"name": string, "change": string}],
  "summary": string,
  "confidenceScore": number
}`,

      anomaly: `You are an anomaly detection AI for a hypermarket. Analyze the product data for unusual patterns:
- Prices significantly above/below base prices
- Stock levels that seem abnormal
- Demand mismatches (high demand + low stock or vice versa)
- Any suspicious patterns

Respond in JSON format:
{
  "anomalies": [{"productId": string, "name": string, "type": "price"|"stock"|"demand"|"pattern", "severity": "high"|"medium"|"low", "description": string}],
  "riskScore": number,
  "summary": string
}`,

      recommendations: `You are a smart recommendations AI for a hypermarket. Based on the product data, suggest:
1. Bundle promotions (products that go well together)
2. Markdown candidates (slow movers)
3. Premium upsell opportunities
4. Seasonal strategies

Respond in JSON format:
{
  "bundles": [{"products": [string], "discount": string, "reason": string}],
  "markdowns": [{"name": string, "suggestedDiscount": string, "reason": string}],
  "upsells": [{"name": string, "strategy": string}],
  "seasonal": [string],
  "summary": string
}`
    };

    const systemPrompt = systemPrompts[action];
    if (!systemPrompt) throw new Error(`Unknown action: ${action}`);

    // Prepare concise product data for the AI
    const productSummary = products.map((p: any) => ({
      id: p.id,
      name: p.name,
      stock: p.stock,
      reorderLevel: p.reorderLevel,
      basePrice: p.basePrice,
      currentPrice: p.currentPrice,
      demandLevel: p.demandLevel,
      demandForecast: p.demandForecast,
      category: p.category
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
          { role: "user", content: `Here is the current product inventory data:\n${JSON.stringify(productSummary, null, 2)}` },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
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
      return new Response(JSON.stringify({ error: "AI service temporarily unavailable." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = { summary: content, raw: true };
    }

    return new Response(JSON.stringify({ action, result: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-automation error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
