import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

const jsonHeaders = { ...corsHeaders, "Content-Type": "application/json" };

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: jsonHeaders }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
    } = await userClient.auth.getUser();

    if (!user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: jsonHeaders }
      );
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const userId = user.id;
    const userEmail = user.email;

    const { data: adminCheck } = await adminClient
      .from("admins")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (adminCheck) {
      return new Response(
        JSON.stringify({ error: "Admin accounts cannot be deleted this way" }),
        { status: 403, headers: jsonHeaders }
      );
    }

    const { data: memberRecord } = await adminClient
      .from("members")
      .select("id")
      .eq("email", userEmail)
      .maybeSingle();

    if (memberRecord) {
      await adminClient
        .from("membership_notifications")
        .delete()
        .eq("member_id", memberRecord.id);

      await adminClient
        .from("membership_renewals")
        .delete()
        .eq("member_id", memberRecord.id);

      await adminClient
        .from("family_members")
        .delete()
        .eq("member_id", memberRecord.id);

      await adminClient
        .from("service_bookings")
        .delete()
        .eq("member_id", memberRecord.id);

      await adminClient
        .from("member_payments")
        .delete()
        .eq("member_id", memberRecord.id);

      await adminClient
        .from("members")
        .delete()
        .eq("id", memberRecord.id);
    }

    const { data: apps } = await adminClient
      .from("membership_applications")
      .select("id")
      .eq("user_id", userId);

    if (apps && apps.length > 0) {
      const appIds = apps.map((a: { id: string }) => a.id);
      await adminClient
        .from("membership_application_family_members")
        .delete()
        .in("application_id", appIds);
    }

    await adminClient
      .from("membership_applications")
      .delete()
      .eq("user_id", userId);

    await adminClient
      .from("wakala_applications")
      .delete()
      .eq("user_id", userId);

    await adminClient
      .from("bookings")
      .delete()
      .eq("user_id", userId);

    await adminClient
      .from("notifications")
      .delete()
      .eq("user_id", userId);

    await adminClient
      .from("login_history")
      .delete()
      .eq("user_id", userId);

    await adminClient
      .from("member_profiles")
      .delete()
      .eq("id", userId);

    await adminClient
      .from("stripe_customers")
      .delete()
      .eq("user_id", userId);

    const { error: deleteError } =
      await adminClient.auth.admin.deleteUser(userId);

    if (deleteError) {
      return new Response(
        JSON.stringify({ error: `Failed to delete auth user: ${deleteError.message}` }),
        { status: 500, headers: jsonHeaders }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: jsonHeaders }
    );
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: jsonHeaders }
    );
  }
});
