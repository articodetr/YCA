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

function generatePassword(length = 12): string {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghjkmnpqrstuvwxyz";
  const digits = "23456789";
  const all = upper + lower + digits;
  const required = [
    upper[Math.floor(Math.random() * upper.length)],
    lower[Math.floor(Math.random() * lower.length)],
    digits[Math.floor(Math.random() * digits.length)],
  ];
  const remaining = Array.from({ length: length - 3 }, () =>
    all[Math.floor(Math.random() * all.length)]
  );
  const chars = [...required, ...remaining];
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}

function generateMemberNumber(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 900000) + 100000;
  return `YCA-${year}-${rand}`;
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
      return errorResponse("Only active admins can manage members", 403);
    }

    const body = await req.json();
    const { action } = body;

    if (action === "create") {
      const {
        first_name,
        last_name,
        email,
        phone,
        membership_type,
        payment_amount,
        payment_date,
        payment_method,
        notes,
        business_support_tier,
        custom_amount,
        payment_frequency,
      } = body;

      if (!first_name || !last_name || !email || !phone || !membership_type) {
        return errorResponse(
          "first_name, last_name, email, phone, and membership_type are required"
        );
      }

      const validTypes = [
        "individual",
        "family",
        "associate",
        "business_support",
        "organization",
      ];
      if (!validTypes.includes(membership_type)) {
        return errorResponse("Invalid membership type");
      }

      const password = generatePassword();
      const memberNumber = generateMemberNumber();

      const { data: authUser, error: authError } =
        await adminClient.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: {
            full_name: `${first_name} ${last_name}`,
            phone,
          },
        });

      if (authError) {
        return errorResponse(authError.message);
      }

      const now = new Date().toISOString();
      const startDate = new Date().toISOString().split("T")[0];
      const expiryDate = new Date(
        new Date().setFullYear(new Date().getFullYear() + 1)
      )
        .toISOString()
        .split("T")[0];

      const { error: appError } = await adminClient
        .from("membership_applications")
        .insert({
          first_name,
          last_name,
          email,
          phone,
          address: "",
          membership_type,
          status: "approved",
          payment_status: "completed",
          business_support_tier: business_support_tier || null,
          custom_amount: custom_amount || null,
          payment_frequency: payment_frequency || null,
          user_id: authUser.user.id,
          created_at: now,
          updated_at: now,
        });

      if (appError) {
        await adminClient.auth.admin.deleteUser(authUser.user.id);
        return errorResponse(`Failed to create application: ${appError.message}`);
      }

      const memberType =
        membership_type === "organization" ? "associate" : membership_type;

      const memberInsert: Record<string, unknown> = {
        membership_type: memberType,
        first_name,
        last_name,
        email,
        phone,
        status: "active",
        start_date: startDate,
        expiry_date: expiryDate,
        metadata: notes ? { admin_notes: notes } : {},
      };

      if (memberType === "business_support") {
        memberInsert.business_support_tier = business_support_tier || null;
        memberInsert.custom_amount = custom_amount || null;
        memberInsert.payment_frequency = payment_frequency || null;
      }

      const { data: memberRow, error: memberError } = await adminClient
        .from("members")
        .insert(memberInsert)
        .select("id, member_number")
        .single();

      if (memberError) {
        await adminClient
          .from("membership_applications")
          .delete()
          .eq("user_id", authUser.user.id);
        await adminClient.auth.admin.deleteUser(authUser.user.id);
        return errorResponse(`Failed to create member: ${memberError.message}`);
      }

      const actualMemberNumber = memberRow?.member_number || memberNumber;

      if (memberRow && payment_amount && payment_amount > 0) {
        await adminClient.from("member_payments").insert({
          member_id: memberRow.id,
          payment_type: "membership",
          amount: payment_amount,
          currency: "GBP",
          payment_method: payment_method || "cash",
          status: "completed",
          payment_date: payment_date || now,
          metadata: {
            added_by_admin: user.id,
            notes: notes || "",
          },
        });
      }

      return successResponse({
        success: true,
        user_id: authUser.user.id,
        member_number: actualMemberNumber,
        email,
        password,
      });
    }

    return errorResponse("Invalid action");
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Internal server error";
    return errorResponse(message, 500);
  }
});
