import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.1";
import Stripe from "npm:stripe@17.7.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, { apiVersion: "2024-11-20.acacia" })
  : null;

interface ActivationRequest {
  application_id: string;
  user_id?: string;
  payment_intent_id?: string;
}

Deno.serve(async (req: Request) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response(null, { status: 200, headers: corsHeaders });
    }

    if (req.method !== "POST") {
      return Response.json(
        { error: "Method not allowed" },
        { status: 405, headers: corsHeaders }
      );
    }

    const body = (await req.json()) as ActivationRequest;
    const { application_id, user_id, payment_intent_id } = body;

    if (!application_id) {
      return Response.json(
        { success: false, error: "application_id is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    console.info(`Activating membership for application: ${application_id}`);

    const { data: application, error: appError } = await supabase
      .from("membership_applications")
      .select("*")
      .eq("id", application_id)
      .single();

    if (appError || !application) {
      console.error("Error fetching application:", appError);
      return Response.json(
        { success: false, error: "Application not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    const piId = payment_intent_id || application.payment_intent_id;

    if (stripe && piId) {
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(piId);
        if (paymentIntent.status !== "succeeded") {
          console.error(`Payment not succeeded. Status: ${paymentIntent.status}`);
          return Response.json(
            { success: false, error: "Payment has not been completed" },
            { status: 400, headers: corsHeaders }
          );
        }
      } catch (stripeErr: any) {
        console.error("Stripe verification error:", stripeErr.message);
      }
    }

    await supabase
      .from("membership_applications")
      .update({ payment_status: "completed" })
      .eq("id", application_id);

    const memberId = user_id || application.user_id;
    if (!memberId) {
      return Response.json(
        { success: false, error: "user_id is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    const { data: existingMember } = await supabase
      .from("members")
      .select("*")
      .eq("id", memberId)
      .maybeSingle();

    if (existingMember) {
      console.info(
        `Member already exists with number: ${existingMember.member_number}`
      );

      await supabase
        .from("membership_applications")
        .update({
          status: "approved",
          metadata: {
            ...application.metadata,
            member_number: existingMember.member_number,
            already_existed: true,
          },
        })
        .eq("id", application_id);

      return Response.json(
        {
          success: true,
          member: existingMember,
          message: "Member already activated",
        },
        { headers: corsHeaders }
      );
    }

    const startDate = new Date();
    const currentYear = startDate.getFullYear();
    const expiryDate = new Date(currentYear, 11, 31);

    const { data: newMember, error: memberError } = await supabase
      .from("members")
      .insert({
        id: memberId,
        membership_type: application.membership_type,
        first_name: application.first_name,
        last_name: application.last_name,
        email: application.email,
        phone: application.phone,
        address: application.address,
        postcode: application.postcode,
        date_of_birth: application.date_of_birth,
        business_name: application.business_name,
        business_support_tier: application.business_support_tier,
        custom_amount: application.custom_amount,
        payment_frequency: application.payment_frequency,
        status: "active",
        start_date: startDate.toISOString().split("T")[0],
        expiry_date: expiryDate.toISOString().split("T")[0],
        auto_renewal: false,
      })
      .select()
      .single();

    if (memberError) {
      console.error("Error creating member record:", memberError);
      return Response.json(
        { success: false, error: memberError.message },
        { status: 500, headers: corsHeaders }
      );
    }

    console.info(
      `Created member record with number: ${newMember.member_number}`
    );

    await supabase
      .from("membership_applications")
      .update({
        status: "approved",
        metadata: {
          ...application.metadata,
          member_number: newMember.member_number,
          member_created_at: new Date().toISOString(),
          auto_activated: true,
        },
      })
      .eq("id", application_id);

    return Response.json(
      {
        success: true,
        member: newMember,
        message: "Membership activated successfully",
      },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error("Error activating membership:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
});
