import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
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

const ALLOWED_TABLES = [
  "wakala_applications",
  "membership_applications",
  "volunteer_applications",
  "partnership_inquiries",
  "event_registrations",
  "newsletter_subscriptions",
  "contact_submissions",
  "donations",
  "members",
  "member_payments",
  "hero_slides",
  "form_questions",
  "form_responses",
  "complaints",
  "service_feedback",
  "legal_requests",
];

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
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

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
    const { action, table, id, ids, data: updateData } = body;

    if (!table || !ALLOWED_TABLES.includes(table)) {
      return errorResponse(`Table '${table}' is not allowed`);
    }

    if (action === "delete") {
      if (!id) {
        return errorResponse("id is required for delete");
      }

      const { error, count } = await adminClient
        .from(table)
        .delete()
        .eq("id", id);

      if (error) {
        return errorResponse(error.message, 500);
      }

      return successResponse({ success: true, deleted: true });
    }

    if (action === "delete_many") {
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return errorResponse("ids array is required for delete_many");
      }

      const { error } = await adminClient
        .from(table)
        .delete()
        .in("id", ids);

      if (error) {
        return errorResponse(error.message, 500);
      }

      return successResponse({ success: true, deleted: ids.length });
    }

    if (action === "update") {
      if (!id || !updateData) {
        return errorResponse("id and data are required for update");
      }

      const { error } = await adminClient
        .from(table)
        .update(updateData)
        .eq("id", id);

      if (error) {
        return errorResponse(error.message, 500);
      }

      return successResponse({ success: true });
    }

    return errorResponse("Invalid action. Use: delete, delete_many, update");
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Internal server error";
    return errorResponse(message, 500);
  }
});
