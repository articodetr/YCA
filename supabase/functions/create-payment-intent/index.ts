import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@17.6.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface DonationRequest {
  amount: number;
  fullName: string;
  email: string;
  phone: string;
  donationType: 'one-time' | 'monthly';
  message?: string;
}

interface PaymentRequest {
  amount: number;
  currency: string;
  metadata: {
    user_id?: string;
    application_id?: string;
    wakala_id?: string;
    type?: string;
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");

    console.log('Stripe key exists:', !!stripeSecretKey);
    console.log('Stripe key starts with sk_test_:', stripeSecretKey?.startsWith('sk_test_'));

    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY not configured");
    }

    if (!stripeSecretKey.startsWith('sk_test_') && !stripeSecretKey.startsWith('sk_live_')) {
      throw new Error("Invalid STRIPE_SECRET_KEY format. Please use a valid Stripe key from your Stripe Dashboard.");
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2024-12-18.acacia",
    });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (req.method === "POST") {
      const body = await req.json();

      if (!body.amount || body.amount <= 0) {
        throw new Error("Invalid amount");
      }

      // Check if this is a donation request (has fullName, email, phone)
      if (body.fullName && body.email && body.phone) {
        const { amount, fullName, email, phone, donationType, message } = body as DonationRequest;

        let customer;
        const existingCustomers = await stripe.customers.list({
          email: email,
          limit: 1,
        });

        if (existingCustomers.data.length > 0) {
          customer = existingCustomers.data[0];
        } else {
          customer = await stripe.customers.create({
            email: email,
            name: fullName,
            phone: phone,
            metadata: {
              donation_type: donationType,
            },
          });
        }

        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(amount * 100),
          currency: "gbp",
          customer: customer.id,
          metadata: {
            full_name: fullName,
            email: email,
            phone: phone,
            donation_type: donationType,
            message: message || "",
          },
          description: `${donationType === 'monthly' ? 'Monthly' : 'One-time'} donation from ${fullName}`,
        });

        const { data: donation, error: dbError } = await supabase
          .from("donations")
          .insert({
            full_name: fullName,
            email: email,
            phone: phone,
            amount: amount,
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
            amount: amount,
            customer_id: customer.id,
          },
        });

        return new Response(
          JSON.stringify({
            clientSecret: paymentIntent.client_secret,
            donationId: donation?.id,
          }),
          {
            status: 200,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      } else {
        // This is a membership or wakala payment
        const { amount, currency, metadata } = body as PaymentRequest;

        const paymentIntent = await stripe.paymentIntents.create({
          amount: amount,
          currency: currency || "gbp",
          metadata: metadata || {},
          description: `${metadata?.type || 'Payment'} for user ${metadata?.user_id}`,
        });

        // Update the application status to indicate payment initiated
        if (metadata?.application_id) {
          await supabase
            .from("membership_applications")
            .update({ payment_status: "pending" })
            .eq("id", metadata.application_id);
        }

        if (metadata?.wakala_id) {
          await supabase
            .from("wakala_applications")
            .update({ payment_status: "pending" })
            .eq("id", metadata.wakala_id);
        }

        return new Response(
          JSON.stringify({
            clientSecret: paymentIntent.client_secret,
          }),
          {
            status: 200,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }
    }

    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error:", error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "An error occurred",
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
