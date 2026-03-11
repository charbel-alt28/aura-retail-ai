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

// Rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60_000;

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

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Auth
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

    if (!checkRateLimit(user.id)) {
      return new Response(JSON.stringify({ error: "Too many requests. Please wait." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let body: any;
    try { body = await req.json(); } catch {
      return new Response(JSON.stringify({ error: "Invalid request body" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { message, customerName, conversationHistory, products } = body;

    if (!message || typeof message !== "string" || message.length > 2000) {
      return new Response(JSON.stringify({ error: "Message is required (max 2000 chars)" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("AI service not configured");

    // Build product context for availability checking
    const productContext = Array.isArray(products) && products.length > 0
      ? products.slice(0, 300).map((p: any) => ({
          name: String(p.name || "").slice(0, 100),
          stock: Number(p.stock) || 0,
          currentPrice: Number(p.currentPrice) || 0,
          basePrice: Number(p.basePrice) || 0,
          category: String(p.category || "").slice(0, 50),
          demandLevel: p.demandLevel || "medium",
        }))
      : [];

    const systemPrompt = `You are an AI Customer Service Agent for a hypermarket called "HyperMart AI". You are friendly, professional, and helpful.

YOUR CAPABILITIES:
1. **Product Availability**: You have access to real-time inventory data. When customers ask about products, check the inventory and provide stock status, current price, and suggest alternatives if out of stock.
2. **Store Policies**: Return policy (30 days with receipt), Hours (Mon-Sun 8AM-10PM), Free delivery over $50 (same-day before 2PM), Payment (cash, cards, Apple Pay, Google Pay), Loyalty program (5% cashback).
3. **Sentiment Detection**: Detect the customer's emotional tone and adjust your response accordingly. Be extra empathetic with frustrated customers.
4. **Smart Recommendations**: Suggest related products, deals, or bundles based on what the customer is asking about.

RESPONSE FORMAT (JSON):
{
  "response": "Your helpful response text here",
  "sentiment": "positive" | "neutral" | "negative" | "urgent",
  "sentimentScore": number (0-100, where 0 is very negative, 100 is very positive),
  "category": "product_inquiry" | "return_policy" | "delivery" | "payment" | "loyalty" | "complaint" | "general" | "hours" | "availability",
  "productsMentioned": ["product names if any"],
  "suggestedProducts": [{"name": "string", "reason": "string"}],
  "resolved": boolean,
  "escalationNeeded": boolean,
  "escalationReason": "string or null"
}

INVENTORY DATA:
${JSON.stringify(productContext, null, 1)}

Be concise but thorough. If a product is in stock, mention the price and stock level. If out of stock (0 units), suggest similar alternatives from the inventory. Always maintain a warm, professional tone.`;

    const messages: any[] = [
      { role: "system", content: systemPrompt },
    ];

    // Add conversation history for context
    if (Array.isArray(conversationHistory)) {
      for (const msg of conversationHistory.slice(-10)) {
        if (msg.role === "user" || msg.role === "assistant") {
          messages.push({
            role: msg.role,
            content: String(msg.content).slice(0, 1000),
          });
        }
      }
    }

    messages.push({
      role: "user",
      content: `Customer "${customerName || "Guest"}": ${message}`,
    });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "AI rate limit exceeded. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service temporarily unavailable." }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return new Response(JSON.stringify({ error: "AI returned empty response." }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = {
        response: content,
        sentiment: "neutral",
        sentimentScore: 50,
        category: "general",
        productsMentioned: [],
        suggestedProducts: [],
        resolved: true,
        escalationNeeded: false,
        escalationReason: null,
      };
    }

    // Log to agent_logs
    const serviceClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    await serviceClient.from("agent_logs").insert({
      agent_type: "customer_service",
      action: "AI_RESPONSE",
      status: parsed.escalationNeeded ? "warning" : "success",
      details: {
        customerName: customerName || "Guest",
        category: parsed.category,
        sentiment: parsed.sentiment,
        sentimentScore: parsed.sentimentScore,
        resolved: parsed.resolved,
        timestamp: new Date().toISOString(),
      },
    }).then(({ error }) => { if (error) console.error("Log error:", error); });

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("customer-service-ai error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unexpected error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
