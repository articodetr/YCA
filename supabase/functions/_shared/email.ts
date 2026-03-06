export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export function escapeHtml(value: string): string {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function formatDate(date?: string | null, locale = 'en-GB'): string {
  if (!date) return '-';
  const d = new Date(`${date}T00:00:00`);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export async function sendEmails(messages: EmailMessage[]) {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  const from = Deno.env.get('RESEND_FROM_EMAIL');

  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured');
  }

  if (!from) {
    throw new Error('RESEND_FROM_EMAIL is not configured');
  }

  const results: Array<{ to: string; ok: boolean; id?: string; error?: string }> = [];

  for (const message of messages) {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [message.to],
        subject: message.subject,
        html: message.html,
        text: message.text,
        reply_to: message.replyTo,
      }),
    });

    const raw = await response.text();
    let parsed: any = null;
    try {
      parsed = raw ? JSON.parse(raw) : null;
    } catch {
      parsed = null;
    }

    if (!response.ok) {
      results.push({
        to: message.to,
        ok: false,
        error: parsed?.message || raw || `HTTP ${response.status}`,
      });
      continue;
    }

    results.push({
      to: message.to,
      ok: true,
      id: parsed?.id,
    });
  }

  const failed = results.filter((item) => !item.ok);
  return {
    success: failed.length === 0,
    results,
    failed,
  };
}
