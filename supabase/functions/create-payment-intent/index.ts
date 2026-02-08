import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@17.7.0";
import { createClient } from "npm:@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY")!;
const stripe = new Stripe(stripeSecretKey, {
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

    if (!body.amount || body.amount <= 0) {
      return errorResponse("Invalid amount", 400);
    }

    const isDonation = body.fullName && body.email && body.phone;

    if (isDonation) {
      const { amount, fullName, email, phone, donationType, message } = body;

      let customer;
      const existingCustomers = await stripe.customers.list({
        email,
        limit: 1,
      });

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

      const amountInPence = Math.round(amount * 100);

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInPence,
        currency: "gbp",
        customer: customer.id,
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

      const { data: donation, error: dbError } = await supabase
        .from("donations")
        .insert({
          full_name: fullName,
          email,
          phone,
          amount,
          donation_type: donationType,
          message: message || "",
          payment_status: "pending",
          payment_intent_id: paymentIntent.id,
          stripe_customer_id: customer.id,
        })
        .select()
        .single();

      if (dbError) {
        console.error("Database error:", dbError);
        await supabase.from("payment_logs").insert({
          event_type: "database_error",
          payload: { error: dbError, payment_intent_id: paymentIntent.id },
          error_message: dbError.message,
        });
      }

      await supabase.from("payment_logs").insert({
        donation_id: donation?.id || null,
        event_type: "payment_intent_created",
        payload: {
          payment_intent_id: paymentIntent.id,
          amount,
          customer_id: customer.id,
          type: "donation",
        },
      });

      return jsonResponse({
        clientSecret: paymentIntent.client_secret,
        donationId: donation?.id,
      });
    }

    const { amount, currency, metadata } = body;

    const amountInPence =
      metadata?.type === "event_registration" ? amount : amount;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInPence,
      currency: currency || "gbp",
      metadata: metadata || {},
      description: `${metadata?.type || "Payment"} - ${metadata?.user_id || "guest"}`,
    });

    if (metadata?.application_id) {
      await supabase
        .from("membership_applications")
        .update({
          payment_status: "pending",
          payment_intent_id: paymentIntent.id,
        })
        .eq("id", metadata.application_id);
    }

    if (metadata?.wakala_id) {
      await supabase
        .from("wakala_applications")
        .update({
          payment_status: "pending",
          payment_intent_id: paymentIntent.id,
        })
        .eq("id", metadata.wakala_id);
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
        amount: amountInPence,
        type: metadata?.type || "general",
      },
    });

    return jsonResponse({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Error:", error);
    return errorResponse(
      error instanceof Error ? error.message : "An error occurred"
    );
  }
});
