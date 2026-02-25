import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, apikey, Apikey",
};

const jsonHeaders = { ...corsHeaders, "Content-Type": "application/json" };

function errorResponse(message: string, status = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: jsonHeaders,
  });
}

function successResponse(data: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: jsonHeaders });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return errorResponse("Missing authorization header", 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      return errorResponse(
        "Server configuration error: missing SUPABASE_URL, SUPABASE_ANON_KEY, or SUPABASE_SERVICE_ROLE_KEY (set them in Supabase Edge Function secrets).",
        500
      );
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
    } = await userClient.auth.getUser();
    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: callerAdmin } = await adminClient
      .from("admins")
      .select("id, role, is_active")
      .eq("id", user.id)
      .eq("is_active", true)
      .maybeSingle();

    if (!callerAdmin) {
      return errorResponse("Only admins can perform this operation", 403);
    }

    const body = await req.json();
    const { action } = body;

    if (action === "delete_record") {
      const ALLOWED_TABLES = [
        "wakala_applications", "membership_applications", "volunteer_applications",
        "partnership_inquiries", "event_registrations", "newsletter_subscriptions",
        "contact_submissions", "donations", "members", "member_payments",
        "hero_slides", "form_questions", "form_responses",
        "complaints", "service_feedback", "legal_requests",
      ];

      const { table, record_id } = body;
      if (!table || !ALLOWED_TABLES.includes(table)) {
        return errorResponse(`Table '${table}' is not allowed`);
      }
      if (!record_id) {
        return errorResponse("record_id is required");
      }

      const { error } = await adminClient.from(table).delete().eq("id", record_id);
      if (error) {
        return errorResponse(error.message, 500);
      }
      return successResponse({ success: true, deleted: true });
    }

    if (callerAdmin.role !== "super_admin") {
      return errorResponse("Only super admins can manage admin accounts", 403);
    }

    if (action === "create") {
      const { email, password, full_name, role, permissions } = body;

      if (!email || !password || !full_name) {
        return errorResponse("Email, password, and full name are required");
      }

      const validRoles = ["super_admin", "admin", "editor"];
      if (role && !validRoles.includes(role)) {
        return errorResponse("Invalid role");
      }

      const { data: authUser, error: authError } =
        await adminClient.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        });

      if (authError) {
        return errorResponse(authError.message);
      }

      const { error: insertError } = await adminClient.from("admins").insert({
        id: authUser.user.id,
        email,
        full_name,
        role: role || "admin",
        is_active: true,
      });

      if (insertError) {
        await adminClient.auth.admin.deleteUser(authUser.user.id);
        return errorResponse(insertError.message);
      }

      if (permissions && Array.isArray(permissions) && permissions.length > 0) {
        const permRows = permissions.map((key: string) => ({
          admin_id: authUser.user.id,
          permission_key: key,
        }));
        await adminClient.from("admin_permissions").insert(permRows);
      }

      return successResponse({ success: true, user_id: authUser.user.id });
    }

    if (action === "update") {
      const { admin_id, full_name, role, is_active } = body;

      if (!admin_id) {
        return errorResponse("admin_id is required");
      }

      const updates: Record<string, unknown> = {};
      if (full_name !== undefined) updates.full_name = full_name;
      if (role !== undefined) updates.role = role;
      if (is_active !== undefined) updates.is_active = is_active;

      const { error } = await adminClient
        .from("admins")
        .update(updates)
        .eq("id", admin_id);

      if (error) {
        return errorResponse(error.message);
      }

      return successResponse({ success: true });
    }

    return errorResponse("Invalid action");
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Internal server error";
    return errorResponse(message, 500);
  }
});
