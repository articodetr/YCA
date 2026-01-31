import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@17.6.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");

    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY not configured");
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2024-12-18.acacia",
    });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const signature = req.headers.get("stripe-signature");
    const body = await req.text();

    let event: Stripe.Event;

    try {
      event = JSON.parse(body) as Stripe.Event;
    } catch (err) {
      console.error("Error parsing webhook:", err);
      return new Response(
        JSON.stringify({ error: "Webhook error" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    console.log("Webhook event type:", event.type);

    await supabase.from("payment_logs").insert({
      event_type: event.type,
      stripe_event_id: event.id,
      payload: event.data.object,
    });

    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        const { error: updateError } = await supabase
          .from("donations")
          .update({
            payment_status: "succeeded",
          })
          .eq("payment_intent_id", paymentIntent.id);

        if (updateError) {
          console.error("Error updating donation:", updateError);
        } else {
          console.log(
            "Donation updated successfully for payment intent:",
            paymentIntent.id
          );
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        const { error: updateError } = await supabase
          .from("donations")
          .update({
            payment_status: "failed",
          })
          .eq("payment_intent_id", paymentIntent.id);

        if (updateError) {
          console.error("Error updating donation:", updateError);
        }

        await supabase.from("payment_logs").insert({
          event_type: "payment_failed_details",
          payload: {
            payment_intent_id: paymentIntent.id,
            last_payment_error: paymentIntent.last_payment_error,
          },
          error_message: paymentIntent.last_payment_error?.message,
        });
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId = charge.payment_intent as string;

        const { error: updateError } = await supabase
          .from("donations")
          .update({
            payment_status: "refunded",
          })
          .eq("payment_intent_id", paymentIntentId);

        if (updateError) {
          console.error("Error updating donation:", updateError);
        }
        break;
      }
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Webhook error:", error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Webhook error",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
