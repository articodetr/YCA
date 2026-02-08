import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface Member {
  member_id: string;
  member_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  expiry_date: string;
  days_until_expiry: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { days_before } = await req.json();
    const daysToCheck = days_before || 30;

    const { data: members, error: membersError } = await supabase
      .rpc("get_members_needing_notification", { days_before: daysToCheck });

    if (membersError) {
      throw membersError;
    }

    const notifications = [];

    for (const member of members as Member[]) {
      const emailSubject = daysToCheck === 30
        ? `Your YCA Membership Expires in ${daysToCheck} Days | عضويتك في YCA تنتهي خلال ${daysToCheck} يوم`
        : `Urgent: Your YCA Membership Expires in ${member.days_until_expiry} Days | عاجل: عضويتك تنتهي خلال ${member.days_until_expiry} يوم`;

      const emailBody = `
Dear ${member.first_name} ${member.last_name},

This is a friendly reminder that your YCA membership is expiring soon.

Member Number: ${member.member_number}
Expiry Date: ${new Date(member.expiry_date).toLocaleDateString()}
Days Remaining: ${member.days_until_expiry}

To continue enjoying our services, please renew your membership before the expiry date.

You can renew online through your member dashboard or contact us for assistance.

---

عزيزي ${member.first_name} ${member.last_name}،

هذا تذكير ودي بأن عضويتك في YCA على وشك الانتهاء.

رقم العضوية: ${member.member_number}
تاريخ الانتهاء: ${new Date(member.expiry_date).toLocaleDateString('ar-SA')}
الأيام المتبقية: ${member.days_until_expiry}

لمواصلة الاستفادة من خدماتنا، يرجى تجديد عضويتك قبل تاريخ الانتهاء.

يمكنك التجديد عبر الإنترنت من خلال لوحة تحكم الأعضاء أو الاتصال بنا للحصول على المساعدة.

Best regards / مع أطيب التحيات,
Yemen Community Association
      `;

      const { error: notificationError } = await supabase
        .from("membership_notifications")
        .insert({
          member_id: member.member_id,
          notification_type: `expiry_${daysToCheck}_days`,
          email_subject: emailSubject,
          email_body: emailBody,
          status: "sent",
          metadata: {
            days_until_expiry: member.days_until_expiry,
            member_number: member.member_number,
          },
        });

      if (!notificationError) {
        notifications.push({
          member_number: member.member_number,
          email: member.email,
          status: "sent",
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        notifications_sent: notifications.length,
        details: notifications,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error sending notifications:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
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
