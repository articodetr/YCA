import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.1";
import { DateTime } from "npm:luxon@3.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

const LONDON_TZ = "Europe/London";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const RESEND_FROM_EMAIL =
  Deno.env.get("RESEND_FROM_EMAIL") || "noreply@example.com";

function escapeHtml(value: string) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  const dt = DateTime.fromISO(value, { zone: LONDON_TZ });
  if (!dt.isValid) return value;
  return dt.toFormat("dd/MM/yyyy");
}

async function sendEmails(
  messages: Array<{ to: string; subject: string; html: string }>
) {
  if (!RESEND_API_KEY) {
    console.error("Missing RESEND_API_KEY");
    return;
  }

  for (const message of messages) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: RESEND_FROM_EMAIL,
        to: [message.to],
        subject: message.subject,
        html: message.html,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Resend error: ${response.status} ${text}`);
    }
  }
}

function getBookingDateTime(date: string, time: string) {
  return DateTime.fromISO(`${date}T${time}`, { zone: LONDON_TZ });
}

function hoursUntilBooking(date: string, time: string) {
  const booking = getBookingDateTime(date, time);
  return booking.diff(DateTime.now().setZone(LONDON_TZ), "hours").hours;
}

function buildActionEmail(
  application: any,
  action: "cancel" | "reschedule",
  overrides?: Record<string, string>
) {
  const title =
    action === "cancel"
      ? "Appointment cancelled / تم إلغاء الموعد"
      : "Appointment updated / تم تعديل الموعد";

  const intro =
    action === "cancel"
      ? "Your advisory appointment has been cancelled successfully. / تم إلغاء موعدك الاستشاري بنجاح."
      : "Your advisory appointment has been updated successfully. / تم تعديل موعدك الاستشاري بنجاح.";

  const details = [
    ["Reference / المرجع", application.booking_reference || "-"],
    [
      "Date / التاريخ",
      overrides?.booking_date
        ? formatDate(overrides.booking_date)
        : formatDate(application.booking_date),
    ],
    ["Time / الوقت", overrides?.start_time || application.start_time || "-"],
  ]
    .map(
      ([label, value]) => `
    <tr>
      <td style="padding:8px 12px;border:1px solid #e5e7eb;font-weight:600;background:#f9fafb;">${escapeHtml(
        label
      )}</td>
      <td style="padding:8px 12px;border:1px solid #e5e7eb;">${escapeHtml(
        String(value || "-")
      )}</td>
    </tr>
  `
    )
    .join("");

  return `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:0 auto;color:#111827;line-height:1.6;">
      <div style="background:#065f46;color:#ffffff;padding:20px 24px;border-radius:12px 12px 0 0;">
        <h2 style="margin:0;font-size:22px;">${title}</h2>
      </div>
      <div style="border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 12px 12px;">
        <p>Dear ${escapeHtml(application.full_name || "Applicant")},</p>
        <p>${intro}</p>
        <table style="width:100%;border-collapse:collapse;margin:18px 0;">${details}</table>
        <p style="margin-bottom:0;">YCA Birmingham</p>
      </div>
    </div>
  `;
}

async function releaseSlots(adminClient: any, application: any, serviceId: string) {
  if (application.duration_minutes === 60) {
    const { data: allSlots, error: allSlotsError } = await adminClient
      .from("availability_slots")
      .select("id")
      .eq("service_id", serviceId)
      .eq("date", application.booking_date)
      .order("start_time");

    if (allSlotsError) throw allSlotsError;

    const currentIndex = (allSlots || []).findIndex(
      (slot: any) => slot.id === application.slot_id
    );

    if (currentIndex === -1 || currentIndex >= (allSlots || []).length - 1) {
      throw new Error("Could not find the second slot for this booking");
    }

    const nextSlotId = allSlots[currentIndex + 1].id;

    const releaseOne = await adminClient.rpc("release_availability_slot", {
      p_slot_id: application.slot_id,
    });

    if (releaseOne.error || !releaseOne.data?.success) {
      throw new Error(
        releaseOne.error?.message ||
          releaseOne.data?.error ||
          "Failed to release first slot"
      );
    }

    const releaseTwo = await adminClient.rpc("release_availability_slot", {
      p_slot_id: nextSlotId,
    });

    if (releaseTwo.error || !releaseTwo.data?.success) {
      throw new Error(
        releaseTwo.error?.message ||
          releaseTwo.data?.error ||
          "Failed to release second slot"
      );
    }

    return;
  }

  const release = await adminClient.rpc("release_availability_slot", {
    p_slot_id: application.slot_id,
  });

  if (release.error || !release.data?.success) {
    throw new Error(
      release.error?.message || release.data?.error || "Failed to release slot"
    );
  }
}

async function reserveSlots(
  adminClient: any,
  params: {
    serviceId: string;
    bookingDate: string;
    slotId: string;
    durationMinutes: 30 | 60;
  }
) {
  if (params.durationMinutes === 60) {
    const { data: allSlots, error: allSlotsError } = await adminClient
      .from("availability_slots")
      .select("id")
      .eq("service_id", params.serviceId)
      .eq("date", params.bookingDate)
      .order("start_time");

    if (allSlotsError) throw allSlotsError;

    const currentIndex = (allSlots || []).findIndex(
      (slot: any) => slot.id === params.slotId
    );

    if (currentIndex === -1 || currentIndex >= (allSlots || []).length - 1) {
      throw new Error("The selected slot is invalid for a 60-minute booking");
    }

    const nextSlotId = allSlots[currentIndex + 1].id;

    const reserve = await adminClient.rpc("reserve_two_consecutive_slots", {
      p_slot_id_1: params.slotId,
      p_slot_id_2: nextSlotId,
    });

    if (reserve.error || !reserve.data?.success) {
      throw new Error(
        reserve.error?.message || reserve.data?.error || "Failed to reserve slots"
      );
    }

    return;
  }

  const reserve = await adminClient.rpc("reserve_availability_slot", {
    p_slot_id: params.slotId,
  });

  if (reserve.error || !reserve.data?.success) {
    throw new Error(
      reserve.error?.message || reserve.data?.error || "Failed to reserve slot"
    );
  }
}

async function releaseReservedSelection(
  adminClient: any,
  params: {
    serviceId: string;
    bookingDate: string;
    slotId: string;
    durationMinutes: 30 | 60;
  }
) {
  if (params.durationMinutes === 60) {
    const { data: allSlots, error: allSlotsError } = await adminClient
      .from("availability_slots")
      .select("id")
      .eq("service_id", params.serviceId)
      .eq("date", params.bookingDate)
      .order("start_time");

    if (allSlotsError) throw allSlotsError;

    const currentIndex = (allSlots || []).findIndex(
      (slot: any) => slot.id === params.slotId
    );

    if (currentIndex === -1 || currentIndex >= (allSlots || []).length - 1) {
      throw new Error("Could not release the temporary reservation");
    }

    await adminClient.rpc("release_availability_slot", {
      p_slot_id: params.slotId,
    });

    await adminClient.rpc("release_availability_slot", {
      p_slot_id: allSlots[currentIndex + 1].id,
    });

    return;
  }

  await adminClient.rpc("release_availability_slot", {
    p_slot_id: params.slotId,
  });
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

    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: "Missing Supabase environment variables" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData, error: userError } = await userClient.auth.getUser();

    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: "Authentication failed" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const body = await req.json();
    const {
      action,
      applicationId,
      newSlotId,
      newBookingDate,
      newStartTime,
      newEndTime,
      newDurationMinutes,
    } = body || {};

    if (!applicationId || !["cancel", "reschedule"].includes(action)) {
      return new Response(JSON.stringify({ error: "Invalid request payload" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: application, error: appError } = await adminClient
      .from("wakala_applications")
      .select(
        "id, user_id, full_name, email, booking_reference, booking_date, start_time, end_time, duration_minutes, slot_id, status, service_type"
      )
      .eq("id", applicationId)
      .single();

    if (appError || !application) {
      return new Response(JSON.stringify({ error: "Booking not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (application.user_id !== userData.user.id) {
      return new Response(
        JSON.stringify({ error: "You are not allowed to modify this booking" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!String(application.service_type || "").startsWith("advisory_")) {
      return new Response(
        JSON.stringify({ error: "This request is not an advisory booking" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!application.booking_date || !application.start_time) {
      return new Response(
        JSON.stringify({ error: "Booking date/time is missing" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (hoursUntilBooking(application.booking_date, application.start_time) < 3) {
      return new Response(
        JSON.stringify({
          error:
            "Appointments can only be changed or cancelled at least 3 hours before the booked time.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: currentSlot, error: currentSlotError } = await adminClient
      .from("availability_slots")
      .select("service_id")
      .eq("id", application.slot_id)
      .single();

    if (currentSlotError || !currentSlot?.service_id) {
      return new Response(
        JSON.stringify({ error: "Current service slot not found" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (action === "cancel") {
      await releaseSlots(adminClient, application, currentSlot.service_id);

      const updatePayload: Record<string, any> = {
        status: "cancelled",
      };

      const { error: updateError } = await adminClient
        .from("wakala_applications")
        .update(updatePayload)
        .eq("id", application.id);

      if (updateError) throw updateError;

      try {
        const recipient = String(application.email || "").trim();
        if (recipient) {
          await sendEmails([
            {
              to: recipient,
              subject: "Appointment cancelled / تم إلغاء الموعد",
              html: buildActionEmail(application, "cancel"),
            },
          ]);
        }
      } catch (emailError) {
        console.error("Cancellation email error:", emailError);
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (
      !newSlotId ||
      !newBookingDate ||
      !newStartTime ||
      !newEndTime ||
      !newDurationMinutes
    ) {
      return new Response(JSON.stringify({ error: "Missing reschedule fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (hoursUntilBooking(newBookingDate, newStartTime) < 3) {
      return new Response(
        JSON.stringify({
          error: "The new appointment time must also be at least 3 hours in the future.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: newSlot, error: newSlotError } = await adminClient
      .from("availability_slots")
      .select("id, service_id, date, start_time, end_time, is_available")
      .eq("id", newSlotId)
      .single();

    if (newSlotError || !newSlot || !newSlot.is_available) {
      return new Response(
        JSON.stringify({ error: "The selected new slot is no longer available" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    await reserveSlots(adminClient, {
      serviceId: newSlot.service_id,
      bookingDate: newBookingDate,
      slotId: newSlotId,
      durationMinutes: Number(newDurationMinutes) === 60 ? 60 : 30,
    });

    try {
      await releaseSlots(adminClient, application, currentSlot.service_id);

      const { error: updateError } = await adminClient
        .from("wakala_applications")
        .update({
          booking_date: newBookingDate,
          requested_date: newBookingDate,
          slot_id: newSlotId,
          start_time: newStartTime,
          end_time: newEndTime,
          duration_minutes: Number(newDurationMinutes) === 60 ? 60 : 30,
        })
        .eq("id", application.id);

      if (updateError) throw updateError;
    } catch (error) {
      try {
        await releaseReservedSelection(adminClient, {
          serviceId: newSlot.service_id,
          bookingDate: newBookingDate,
          slotId: newSlotId,
          durationMinutes: Number(newDurationMinutes) === 60 ? 60 : 30,
        });
      } catch (_rollbackError) {
        console.error("Rollback after reschedule failure also failed");
      }
      throw error;
    }

    try {
      const recipient = String(application.email || "").trim();
      if (recipient) {
        await sendEmails([
          {
            to: recipient,
            subject: "Appointment updated / تم تعديل الموعد",
            html: buildActionEmail(application, "reschedule", {
              booking_date: newBookingDate,
              start_time: newStartTime,
            }),
          },
        ]);
      }
    } catch (emailError) {
      console.error("Reschedule email error:", emailError);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("manage-advisory-booking error:", error);

    return new Response(
      JSON.stringify({ error: error?.message || String(error) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});