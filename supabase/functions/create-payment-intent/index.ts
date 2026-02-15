import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@17.7.0";
import { createClient } from "npm:@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY")!;
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2024-11-20.acacia",
  appInfo: { name: "YCA Birmingham", version: "1.0.0" },
});

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

function errorResponse(message: string, status = 500) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function jsonResponse(data: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return errorResponse("Method not allowed", 405);
    }

    const body = await req.json();

    // Basic validation
    if (body.amount === undefined || body.amount === null) {
      return errorResponse("Invalid amount", 400);
    }

    const isDonation = !!(body.fullName && body.email && body.phone);

    // =========================
    // DONATION FLOW
    // =========================
    if (isDonation) {
      const amount = Number(body.amount);
      const fullName = String(body.fullName || "").trim();
      const email = String(body.email || "").trim();
      const phone = String(body.phone || "").trim();
      const donationType = String(body.donationType || "one-time").trim(); // "monthly" | "one-time"
      const message = String(body.message || "").trim();

      if (!amount || amount <= 0) return errorResponse("Invalid amount", 400);
      if (!fullName || !email || !phone) return errorResponse("Missing donor info", 400);

      // Create / reuse Stripe customer
      let customer: Stripe.Customer;
      const existingCustomers = await stripe.customers.list({ email, limit: 1 });

      if (existingCustomers.data.length > 0) {
        customer = existingCustomers.data[0];
      } else {
        customer = await stripe.customers.create({
          email,
          name: fullName,
          phone,
          metadata: { donation_type: donationType },
        });
      }

      // Convert GBP -> pence
      const amountInPence = Math.round(amount * 100);

      // Create PaymentIntent ONLY (no DB insert here)
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInPence,
        currency: "gbp",
        customer: customer.id,
        automatic_payment_methods: { enabled: true },
        metadata: {
          type: "donation",
          full_name: fullName,
          email,
          phone,
          donation_type: donationType,
          message: message || "",
        },
        description: `${donationType === "monthly" ? "Monthly" : "One-time"} donation from ${fullName}`,
      });

      // Log event (optional but useful)
      await supabase.from("payment_logs").insert({
        donation_id: null,
        event_type: "payment_intent_created",
        payload: {
          payment_intent_id: paymentIntent.id,
          amount,
          amount_in_pence: amountInPence,
          customer_id: customer.id,
          type: "donation",
          donation_type: donationType,
          email,
        },
      });

      // IMPORTANT: return ONLY clientSecret (no donationId)
      return jsonResponse({
        clientSecret: paymentIntent.client_secret,
      });
    }

    // =========================
    // GENERAL PAYMENT FLOW
    // =========================
    const amount = Number(body.amount);
    const currency = String(body.currency || "gbp").toLowerCase();
    const metadata = body.metadata || {};

    if (!amount || amount <= 0) return errorResponse("Invalid amount", 400);

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: { enabled: true },
      metadata,
      description: `${metadata?.type || "Payment"} - ${metadata?.user_id || "guest"}`,
    });

    // Link payment intent to application / registration as pending
    if (metadata?.application_id) {
      await supabase
        .from("membership_applications")
        .update({
          payment_status: "pending",
          payment_intent_id: paymentIntent.id,
        })
        .eq("id", metadata.application_id);
    }

    if (metadata?.event_registration_id) {
      await supabase
        .from("event_registrations")
        .update({
          payment_status: "pending",
          payment_intent_id: paymentIntent.id,
        })
        .eq("id", metadata.event_registration_id);
    }

    await supabase.from("payment_logs").insert({
      event_type: "payment_intent_created",
      payload: {
        payment_intent_id: paymentIntent.id,
        amount,
        type: metadata?.type || "general",
      },
    });

    return jsonResponse({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Error:", error);
    return errorResponse(error instanceof Error ? error.message : "An error occurred");
  }
});
