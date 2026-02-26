import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const ALLOWED_TABLES = [
  "wakala_applications",
  "translation_requests",
  "other_legal_requests",
  "partnership_inquiries",
  "volunteer_applications",
];

const WAKALA_EXCLUDED_FIELDS = ["payment_id"];

// Membership benefits rules
const MEMBER_WAIT_DAYS = 30;
const STANDARD_PRICE = 40;
const MEMBER_PRICE = 20;

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function getRequestedAmount(table: string, data: Record<string, unknown>): number | null {
  if (table === "wakala_applications") {
    return toNumber(data.fee_amount);
  }
  // translation_requests / other_legal_requests
  return toNumber(data.amount_due ?? data.amount);
}

function isDiscountedOrFree(amount: number | null, paymentStatus: string | null): boolean {
  if (paymentStatus === "free") return true;
  if (amount === null) return false;
  return amount < STANDARD_PRICE;
}

function isFree(amount: number | null, paymentStatus: string | null): boolean {
  if (paymentStatus === "free") return true;
  return amount === 0;
}

async function getAuthEmail(adminClient: any, userId: string): Promise<string | null> {
  try {
    const { data, error } = await adminClient.auth.admin.getUserById(userId);
    if (error) {
      console.error("auth.admin.getUserById error:", error);
      return null;
    }
    return (data?.user?.email ?? null) as string | null;
  } catch (err) {
    console.error("getAuthEmail exception:", err);
    return null;
  }
}

async function getMemberEligibility(adminClient: any, email: string): Promise<{ ok: boolean; daysSinceStart: number | null }>{
  const { data: member, error } = await adminClient
    .from("members")
    .select("start_date, status")
    .eq("email", email)
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    console.error("members lookup error:", error);
    return { ok: false, daysSinceStart: null };
  }
  if (!member?.start_date) {
    return { ok: false, daysSinceStart: null };
  }

  const start = new Date(member.start_date);
  const now = new Date();
  const days = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return { ok: days >= MEMBER_WAIT_DAYS, daysSinceStart: days };
}

async function countPriorLegalRequests(adminClient: any, userId: string): Promise<number> {
  const [wRes, tRes, oRes] = await Promise.all([
    adminClient
      .from("wakala_applications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      // Do not count rejected/pending_payment as completed usage
      .not("status", "in", "(rejected,pending_payment)"),
    adminClient
      .from("translation_requests")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    adminClient
      .from("other_legal_requests")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
  ]);

  const w = (wRes?.count ?? 0) as number;
  const t = (tRes?.count ?? 0) as number;
  const o = (oRes?.count ?? 0) as number;
  return w + t + o;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { table, data } = body;

    if (!table || !ALLOWED_TABLES.includes(table)) {
      return new Response(JSON.stringify({ error: "Invalid table" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!data || typeof data !== "object") {
      return new Response(JSON.stringify({ error: "Missing data" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    let insertData: Record<string, unknown> = { ...data };

    if (table === "wakala_applications") {
      for (const field of WAKALA_EXCLUDED_FIELDS) {
        delete insertData[field];
      }
    }

    // Defaults
    insertData.payment_status = (insertData.payment_status as string) || "paid";
    insertData.status = (insertData.status as string) || "submitted";

    // Enforce membership rules for discounted/free legal services.
    if (["wakala_applications", "translation_requests", "other_legal_requests"].includes(table)) {
      const requestedAmount = getRequestedAmount(table, insertData);
      const paymentStatus = (insertData.payment_status as string | null) ?? null;

      if (isDiscountedOrFree(requestedAmount, paymentStatus)) {
        const userId = (insertData.user_id as string | null) ?? null;
        if (!userId) {
          return new Response(
            JSON.stringify({
              error:
                "Membership benefits require a logged-in member account. Please sign in and try again.",
            }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const authEmail = await getAuthEmail(adminClient, userId);
        if (!authEmail) {
          return new Response(
            JSON.stringify({ error: "Could not validate member identity. Please sign in again." }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // If the client passed an email, ensure it matches the authenticated email.
        const clientEmail = (insertData.email as string | null) ?? null;
        if (clientEmail && clientEmail.toLowerCase() !== authEmail.toLowerCase()) {
          return new Response(
            JSON.stringify({ error: "Email mismatch. Please use your member account email." }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Normalize email to the authenticated one.
        insertData.email = authEmail;

        const eligibility = await getMemberEligibility(adminClient, authEmail);
        if (!eligibility.ok) {
          const days = eligibility.daysSinceStart;
          const remaining = days === null ? null : Math.max(0, MEMBER_WAIT_DAYS - days);
          return new Response(
            JSON.stringify({
              error:
                remaining === null
                  ? `Member discounts/free services are available after ${MEMBER_WAIT_DAYS} days of active membership.`
                  : `Member discounts/free services are available after ${MEMBER_WAIT_DAYS} days. (${remaining} days remaining)`
            }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Free service rule: one-time FREE across all legal services.
        if (isFree(requestedAmount, paymentStatus)) {
          const totalPrior = await countPriorLegalRequests(adminClient, userId);
          if (totalPrior > 0) {
            return new Response(
              JSON.stringify({
                error:
                  "You have already used your one-time free legal service (or have a previous legal request). Please proceed with the member rate instead.",
              }),
              { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        }

        // Keep is_first_* fields consistent if provided/expected.
        if (table === "wakala_applications") {
          const totalPrior = await countPriorLegalRequests(adminClient, userId);
          insertData.is_first_wakala = totalPrior === 0;
        } else {
          const totalPrior = await countPriorLegalRequests(adminClient, userId);
          insertData.is_first_request = totalPrior === 0;
        }

        // If discounted but not free, enforce MEMBER_PRICE.
        if (!isFree(requestedAmount, paymentStatus) && requestedAmount !== null && requestedAmount < STANDARD_PRICE) {
          if (requestedAmount !== MEMBER_PRICE) {
            return new Response(
              JSON.stringify({
                error: `Invalid member price. Expected £${MEMBER_PRICE}.`,
              }),
              { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        }
      }
    }

    const { data: record, error } = await adminClient
      .from(table)
      .insert([insertData])
      .select("id, booking_reference")
      .maybeSingle();

    if (error) {
      console.error("DB insert error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ id: record?.id, booking_reference: record?.booking_reference }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Unhandled error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
