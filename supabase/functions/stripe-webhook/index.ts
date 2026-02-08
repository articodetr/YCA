import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@17.7.0";
import { createClient } from "npm:@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY")!;
const stripeWebhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
const stripe = new Stripe(stripeSecret, {
  appInfo: { name: "YCA Birmingham", version: "1.0.0" },
});

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

Deno.serve(async (req) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response(null, { status: 200, headers: corsHeaders });
    }

    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405, headers: corsHeaders });
    }

    const body = await req.text();
    let event: Stripe.Event;

    if (stripeWebhookSecret) {
      const signature = req.headers.get("stripe-signature");
      if (!signature) {
        return new Response("No signature found", { status: 400, headers: corsHeaders });
      }
      try {
        event = await stripe.webhooks.constructEventAsync(
          body,
          signature,
          stripeWebhookSecret
        );
      } catch (error: any) {
        console.error(`Webhook signature verification failed: ${error.message}`);
        return new Response(
          `Webhook signature verification failed: ${error.message}`,
          { status: 400, headers: corsHeaders }
        );
      }
    } else {
      event = JSON.parse(body) as Stripe.Event;
      console.warn("STRIPE_WEBHOOK_SECRET not set - skipping signature verification (test mode only)");
    }

    EdgeRuntime.waitUntil(handleEvent(event));

    return Response.json({ received: true }, { headers: corsHeaders });
  } catch (error: any) {
    console.error("Error processing webhook:", error);
    return Response.json(
      { error: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
});

async function handleEvent(event: Stripe.Event) {
  console.info(`Processing event: ${event.type} (${event.id})`);

  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      default:
        console.info(`Unhandled event type: ${event.type}`);
    }

    await supabase.from("payment_logs").insert({
      event_type: event.type,
      stripe_event_id: event.id,
      payload: event.data.object,
    });
  } catch (error: any) {
    console.error(`Error handling event ${event.type}:`, error);
    await supabase.from("payment_logs").insert({
      event_type: event.type,
      stripe_event_id: event.id,
      payload: event.data.object,
      error_message: error.message,
    });
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const metadata = paymentIntent.metadata || {};
  const paymentIntentId = paymentIntent.id;

  console.info(`Payment succeeded: ${paymentIntentId}, metadata:`, metadata);

  const { error: donationError } = await supabase
    .from("donations")
    .update({ payment_status: "succeeded", updated_at: new Date().toISOString() })
    .eq("payment_intent_id", paymentIntentId);

  if (donationError) {
    console.info("No donation found for this payment intent (may be another type)");
  } else {
    console.info(`Updated donation payment_status to succeeded for PI: ${paymentIntentId}`);
  }

  if (metadata.application_id) {
    const { error: updateError } = await supabase
      .from("membership_applications")
      .update({ payment_status: "paid" })
      .eq("id", metadata.application_id);

    if (updateError) {
      console.error("Error updating membership application:", updateError);
    } else {
      console.info(`Updated membership application ${metadata.application_id} to paid`);

      try {
        const activateResponse = await fetch(
          `${Deno.env.get("SUPABASE_URL")}/functions/v1/activate-membership`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
            },
            body: JSON.stringify({
              application_id: metadata.application_id,
              user_id: metadata.user_id,
            }),
          }
        );

        const activateData = await activateResponse.json();
        if (activateResponse.ok && activateData.success) {
          console.info(`Activated membership for application ${metadata.application_id}, member number: ${activateData.member.member_number}`);
        } else {
          console.error("Failed to activate membership:", activateData.error);
        }
      } catch (activateErr: any) {
        console.error("Error calling activate-membership function:", activateErr.message);
      }
    }
  }

  if (metadata.wakala_id) {
    const { error } = await supabase
      .from("wakala_applications")
      .update({ payment_status: "paid", status: "submitted" })
      .eq("id", metadata.wakala_id);

    if (error) {
      console.error("Error updating wakala application:", error);
    } else {
      console.info(`Updated wakala application ${metadata.wakala_id} to paid`);
    }
  }

  if (metadata.event_registration_id) {
    const { error } = await supabase
      .from("event_registrations")
      .update({
        payment_status: "paid",
        payment_intent_id: paymentIntentId,
        status: "confirmed",
      })
      .eq("id", metadata.event_registration_id);

    if (error) {
      console.error("Error updating event registration:", error);
    } else {
      console.info(`Updated event registration ${metadata.event_registration_id} to paid`);
    }
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  const metadata = paymentIntent.metadata || {};
  const paymentIntentId = paymentIntent.id;

  console.info(`Payment failed: ${paymentIntentId}`);

  await supabase
    .from("donations")
    .update({ payment_status: "failed", updated_at: new Date().toISOString() })
    .eq("payment_intent_id", paymentIntentId);

  if (metadata.application_id) {
    await supabase
      .from("membership_applications")
      .update({ payment_status: "failed" })
      .eq("id", metadata.application_id);
  }

  if (metadata.wakala_id) {
    await supabase
      .from("wakala_applications")
      .update({ payment_status: "failed" })
      .eq("id", metadata.wakala_id);
  }

  if (metadata.event_registration_id) {
    await supabase
      .from("event_registrations")
      .update({ payment_status: "failed", status: "cancelled" })
      .eq("id", metadata.event_registration_id);
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const customerId = session.customer as string;
  if (!customerId) {
    console.info("No customer on checkout session, skipping");
    return;
  }

  if (session.mode === "subscription") {
    await syncCustomerSubscription(customerId);
  } else if (session.mode === "payment" && session.payment_status === "paid") {
    const { error } = await supabase.from("stripe_orders").insert({
      checkout_session_id: session.id,
      payment_intent_id: session.payment_intent,
      customer_id: customerId,
      amount_subtotal: session.amount_subtotal,
      amount_total: session.amount_total,
      currency: session.currency,
      payment_status: session.payment_status,
      status: "completed",
    });

    if (error) {
      console.error("Error inserting order:", error);
    }
  }
}

async function syncCustomerSubscription(customerId: string) {
  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 1,
      status: "all",
      expand: ["data.default_payment_method"],
    });

    if (subscriptions.data.length === 0) {
      await supabase.from("stripe_subscriptions").upsert(
        { customer_id: customerId, subscription_status: "not_started" },
        { onConflict: "customer_id" }
      );
      return;
    }

    const subscription = subscriptions.data[0];

    await supabase.from("stripe_subscriptions").upsert(
      {
        customer_id: customerId,
        subscription_id: subscription.id,
        price_id: subscription.items.data[0].price.id,
        current_period_start: subscription.current_period_start,
        current_period_end: subscription.current_period_end,
        cancel_at_period_end: subscription.cancel_at_period_end,
        ...(subscription.default_payment_method &&
        typeof subscription.default_payment_method !== "string"
          ? {
              payment_method_brand:
                subscription.default_payment_method.card?.brand ?? null,
              payment_method_last4:
                subscription.default_payment_method.card?.last4 ?? null,
            }
          : {}),
        status: subscription.status,
      },
      { onConflict: "customer_id" }
    );

    console.info(`Synced subscription for customer: ${customerId}`);
  } catch (error) {
    console.error(`Failed to sync subscription for customer ${customerId}:`, error);
    throw error;
  }
}
