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

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const userId = user.id;
    const userEmail = user.email;

    const { data: adminCheck } = await supabase
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

    const errors: string[] = [];

    const { data: memberRecord } = await supabase
      .from("members")
      .select("id")
      .eq("email", userEmail)
      .maybeSingle();

    if (memberRecord) {
      const memberDeps = [
        { table: "wakala_applications", col: "member_id" },
        { table: "membership_notifications", col: "member_id" },
        { table: "membership_renewals", col: "member_id" },
        { table: "family_members", col: "member_id" },
        { table: "service_bookings", col: "member_id" },
        { table: "member_payments", col: "member_id" },
      ];

      for (const dep of memberDeps) {
        const { error } = await supabase
          .from(dep.table)
          .delete()
          .eq(dep.col, memberRecord.id);
        if (error) errors.push(`${dep.table}: ${error.message}`);
      }

      const { error: memberErr } = await supabase
        .from("members")
        .delete()
        .eq("id", memberRecord.id);
      if (memberErr) errors.push(`members: ${memberErr.message}`);
    }

    const { data: apps } = await supabase
      .from("membership_applications")
      .select("id")
      .eq("user_id", userId);

    if (apps && apps.length > 0) {
      const appIds = apps.map((a: { id: string }) => a.id);
      await supabase
        .from("membership_application_family_members")
        .delete()
        .in("application_id", appIds);
    }

    const noActionTables = [
      { table: "membership_applications", col: "user_id", val: userId },
      { table: "wakala_applications", col: "user_id", val: userId },
      { table: "stripe_customers", col: "user_id", val: userId },
    ];

    for (const item of noActionTables) {
      const { error } = await supabase
        .from(item.table)
        .delete()
        .eq(item.col, item.val);
      if (error) errors.push(`${item.table}: ${error.message}`);
    }

    const cascadeTables = [
      { table: "bookings", col: "user_id" },
      { table: "notifications", col: "user_id" },
      { table: "login_history", col: "user_id" },
      { table: "member_profiles", col: "id" },
    ];

    for (const item of cascadeTables) {
      const { error } = await supabase
        .from(item.table)
        .delete()
        .eq(item.col, userId);
      if (error) errors.push(`${item.table}: ${error.message}`);
    }

    if (errors.length > 0) {
      return new Response(
        JSON.stringify({
          error: `Data cleanup errors: ${errors.join("; ")}`,
        }),
        { status: 500, headers: jsonHeaders }
      );
    }

    const { error: deleteError } =
      await supabase.auth.admin.deleteUser(userId);

    if (deleteError) {
      return new Response(
        JSON.stringify({
          error: `Failed to delete user: ${deleteError.message}`,
        }),
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
